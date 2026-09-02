import os
import uuid
import base64
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated

import requests
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
ADMIN_EMAILS = [e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()]

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="The Cafeteria API")
api = APIRouter(prefix="/api")

EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

# ---------------- Models ----------------
PyObjectId = Annotated[str, BeforeValidator(str)]


def now_utc():
    return datetime.now(timezone.utc)


class MenuItemIn(BaseModel):
    name: str
    description: str = ""
    price: float
    category: str
    image_url: str = ""
    is_veg: bool = True
    is_bestseller: bool = False
    is_todays_special: bool = False
    available: bool = True


class ReviewIn(BaseModel):
    name: str
    rating: int = 5
    comment: str = ""


class OrderItem(BaseModel):
    item_id: str
    name: str
    price: float
    qty: int
    is_veg: bool = True


class OrderIn(BaseModel):
    customer_name: str
    mobile: str
    order_type: str = "delivery"  # delivery | pickup
    address: str = ""
    payment_method: str = "cod"  # cod | online
    delivery_instructions: str = ""
    items: List[OrderItem]
    subtotal: float
    delivery_charge: float = 0
    packaging_charge: float = 0
    total: float


class SettingsIn(BaseModel):
    delivery_charge: float
    packaging_charge: float
    free_delivery_above: float
    offer_banner: str
    party_note: str


# ---------------- Auth helpers ----------------
async def get_current_user(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now_utc():
        raise HTTPException(status_code=401, detail="Session expired")
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_admin(request: Request):
    user = await get_current_user(request)
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------------- Auth routes ----------------
@api.post("/auth/session")
async def create_session(request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        body = await request.json()
        session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")

    resp = requests.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": session_id}, timeout=15)
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    data = resp.json()
    email = data["email"].lower()

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    admin_count = await db.users.count_documents({"is_admin": True})
    if existing:
        user_id = existing["user_id"]
        is_admin = existing.get("is_admin", False)
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        # First user OR allowlisted email becomes admin
        is_admin = (admin_count == 0) or (email in ADMIN_EMAILS)
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": data.get("name", ""),
            "picture": data.get("picture", ""),
            "is_admin": is_admin,
            "created_at": now_utc().isoformat(),
        })

    session_token = data["session_token"]
    expires_at = now_utc() + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": now_utc().isoformat(),
    })

    response.set_cookie(
        key="session_token", value=session_token, httponly=True,
        secure=True, samesite="none", path="/", max_age=7 * 24 * 60 * 60,
    )
    return {"user_id": user_id, "email": email, "name": data.get("name", ""),
            "picture": data.get("picture", ""), "is_admin": is_admin}


@api.get("/auth/me")
async def auth_me(user=Depends(get_current_user)):
    return {"user_id": user["user_id"], "email": user["email"], "name": user.get("name", ""),
            "picture": user.get("picture", ""), "is_admin": user.get("is_admin", False)}


@api.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"ok": True}


# ---------------- Menu routes ----------------
@api.get("/categories")
async def get_categories():
    doc = await db.settings.find_one({"_id": "categories"})
    if doc:
        return doc["list"]
    return CATEGORIES


@api.get("/menu")
async def get_menu(category: Optional[str] = None, search: Optional[str] = None,
                   include_unavailable: bool = False):
    q = {}
    if not include_unavailable:
        q["available"] = True
    if category and category != "All":
        q["category"] = category
    if search:
        q["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    items = await db.menu.find(q, {"_id": 0}).to_list(1000)
    return items


@api.post("/menu")
async def create_menu_item(item: MenuItemIn, user=Depends(require_admin)):
    doc = item.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_utc().isoformat()
    await db.menu.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/menu/{item_id}")
async def update_menu_item(item_id: str, item: MenuItemIn, user=Depends(require_admin)):
    res = await db.menu.update_one({"id": item_id}, {"$set": item.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    updated = await db.menu.find_one({"id": item_id}, {"_id": 0})
    return updated


@api.delete("/menu/{item_id}")
async def delete_menu_item(item_id: str, user=Depends(require_admin)):
    res = await db.menu.delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"ok": True}


@api.post("/upload")
async def upload_image(file: UploadFile = File(...), user=Depends(require_admin)):
    content = await file.read()
    b64 = base64.b64encode(content).decode()
    mime = file.content_type or "image/jpeg"
    return {"url": f"data:{mime};base64,{b64}"}


# ---------------- Orders ----------------
@api.post("/orders")
async def create_order(order: OrderIn):
    doc = order.model_dump()
    doc["id"] = str(uuid.uuid4())
    counter = await db.counters.find_one_and_update(
        {"_id": "order_number"}, {"$inc": {"seq": 1}}, upsert=True, return_document=True
    )
    doc["order_number"] = f"CAF{1000 + counter['seq']}"
    doc["status"] = "pending"
    doc["created_at"] = now_utc().isoformat()
    await db.orders.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/orders")
async def list_orders(mobile: Optional[str] = None, admin: bool = False, request: Request = None):
    if admin:
        await require_admin(request)
        orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
        return orders
    if not mobile:
        return []
    orders = await db.orders.find({"mobile": mobile}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return orders


ORDER_STATUSES = ["pending", "confirmed", "preparing", "out_for_delivery", "completed", "cancelled"]


@api.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, payload: dict, user=Depends(require_admin)):
    status = payload.get("status")
    if status not in ORDER_STATUSES:
        raise HTTPException(status_code=422, detail="Invalid status")
    res = await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"ok": True}


# ---------------- Reviews ----------------
@api.get("/reviews")
async def get_reviews():
    return await db.reviews.find({"approved": True}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.post("/reviews")
async def create_review(review: ReviewIn):
    doc = review.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["approved"] = True
    doc["created_at"] = now_utc().isoformat()
    await db.reviews.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.delete("/reviews/{review_id}")
async def delete_review(review_id: str, user=Depends(require_admin)):
    await db.reviews.delete_one({"id": review_id})
    return {"ok": True}


# ---------------- Settings ----------------
@api.get("/settings")
async def get_settings():
    doc = await db.settings.find_one({"_id": "config"}, {"_id": 0})
    return doc or DEFAULT_SETTINGS


@api.put("/settings")
async def update_settings(settings: SettingsIn, user=Depends(require_admin)):
    await db.settings.update_one({"_id": "config"}, {"$set": settings.model_dump()}, upsert=True)
    return settings.model_dump()


# ---------------- Seed data ----------------
CATEGORIES = ["Drinks & Juice", "Starters", "Noodles", "Fried Rice", "Veg", "Non-Veg", "Roti", "Pakoda"]

DEFAULT_SETTINGS = {
    "delivery_charge": 30,
    "packaging_charge": 15,
    "free_delivery_above": 500,
    "offer_banner": "Flat 10% OFF on your first online order — use code WELCOME10",
    "party_note": "We organize Birthday Parties & Family Functions. Call us to reserve your date!",
}


def img(url):
    return f"{url}?auto=format&fit=crop&w=800&q=80"


SEED_MENU = [
    # Drinks & Juice
    {"name": "Fresh Fruit Punch", "description": "Chilled seasonal fruits blended with mint & lime.", "price": 90, "category": "Drinks & Juice", "image_url": img("https://images.unsplash.com/photo-1662550577541-5e8f192e6514"), "is_veg": True, "is_bestseller": True},
    {"name": "Watermelon Cooler", "description": "Refreshing watermelon juice served ice cold.", "price": 80, "category": "Drinks & Juice", "image_url": img("https://images.unsplash.com/photo-1683531658992-b78c311900a3"), "is_veg": True},
    {"name": "Mint Lime Mocktail", "description": "Zesty lime, fresh mint and soda fizz.", "price": 100, "category": "Drinks & Juice", "image_url": img("https://images.unsplash.com/photo-1578224709521-ecee303b012f"), "is_veg": True, "is_todays_special": True},
    {"name": "Triple Juice Combo", "description": "Orange, mango and mixed berry shots.", "price": 130, "category": "Drinks & Juice", "image_url": img("https://images.unsplash.com/photo-1583577612013-4fecf7bf8f13"), "is_veg": True},
    # Starters
    {"name": "Chicken Tikka Starter", "description": "Char-grilled spiced chicken chunks.", "price": 180, "category": "Starters", "image_url": img("https://images.unsplash.com/photo-1765360024331-25b63e85272e"), "is_veg": False, "is_bestseller": True},
    {"name": "Crispy Veg Fritters", "description": "Golden crunchy mixed veg fritters.", "price": 120, "category": "Starters", "image_url": img("https://images.unsplash.com/photo-1765360024320-b2ab819c6f75"), "is_veg": True},
    # Noodles
    {"name": "Veg Hakka Noodles", "description": "Wok-tossed noodles with crunchy veggies.", "price": 130, "category": "Noodles", "image_url": img("https://images.unsplash.com/photo-1617622141573-2e00d8818f3f"), "is_veg": True, "is_bestseller": True},
    {"name": "Chicken Chowmein", "description": "Classic street-style chicken chowmein.", "price": 160, "category": "Noodles", "image_url": img("https://images.unsplash.com/photo-1617622141675-d3005b9067c5"), "is_veg": False},
    # Fried Rice
    {"name": "Veg Fried Rice", "description": "Fragrant rice tossed with garden veggies.", "price": 130, "category": "Fried Rice", "image_url": img("https://images.unsplash.com/photo-1648421714382-70d47442b354"), "is_veg": True},
    {"name": "Chicken Fried Rice", "description": "Loaded with tender chicken & egg.", "price": 170, "category": "Fried Rice", "image_url": img("https://images.unsplash.com/photo-1767324672816-e09a2a0a3979"), "is_veg": False, "is_todays_special": True},
    {"name": "Prawn Fried Rice", "description": "Hibachi-style prawn fried rice.", "price": 210, "category": "Fried Rice", "image_url": img("https://images.unsplash.com/photo-1741612552052-2c5806e8a9ea"), "is_veg": False},
    # Veg
    {"name": "Paneer Butter Masala", "description": "Cottage cheese in rich buttery tomato gravy.", "price": 190, "category": "Veg", "image_url": img("https://images.unsplash.com/photo-1631452180519-c014fe946bc7"), "is_veg": True, "is_bestseller": True},
    {"name": "Mixed Veg Curry", "description": "Seasonal vegetables in aromatic masala.", "price": 150, "category": "Veg", "image_url": img("https://images.unsplash.com/photo-1585937421612-70a008356fbe"), "is_veg": True},
    {"name": "Dal Tadka", "description": "Yellow lentils tempered with ghee & spices.", "price": 120, "category": "Veg", "image_url": img("https://images.unsplash.com/photo-1596797038530-2c107229654b"), "is_veg": True},
    # Non-Veg
    {"name": "Butter Chicken", "description": "Creamy tomato gravy with tandoori chicken.", "price": 240, "category": "Non-Veg", "image_url": img("https://images.unsplash.com/photo-1742599361451-3f6608b212f0"), "is_veg": False, "is_bestseller": True},
    {"name": "Mutton Rogan Josh", "description": "Slow-cooked mutton in Kashmiri spices.", "price": 290, "category": "Non-Veg", "image_url": img("https://images.unsplash.com/photo-1710091691771-96b2e6d17dac"), "is_veg": False},
    {"name": "Chicken Curry", "description": "Home-style spicy chicken curry.", "price": 210, "category": "Non-Veg", "image_url": img("https://images.unsplash.com/photo-1631292784640-2b24be784d5d"), "is_veg": False},
    # Roti
    {"name": "Butter Naan", "description": "Soft tandoori naan brushed with butter.", "price": 40, "category": "Roti", "image_url": img("https://images.unsplash.com/photo-1697155406014-04dc649b0953"), "is_veg": True},
    {"name": "Tandoori Roti", "description": "Whole wheat roti fresh from the tandoor.", "price": 25, "category": "Roti", "image_url": img("https://images.unsplash.com/photo-1655979284091-eea0e93405ee"), "is_veg": True},
    {"name": "Garlic Naan", "description": "Naan topped with garlic & coriander.", "price": 55, "category": "Roti", "image_url": img("https://images.unsplash.com/photo-1690915475862-336b65f571a3"), "is_veg": True},
    # Pakoda
    {"name": "Onion Pakoda", "description": "Crispy onion fritters with chaat masala.", "price": 90, "category": "Pakoda", "image_url": img("https://images.unsplash.com/photo-1765360024320-b2ab819c6f75"), "is_veg": True, "is_bestseller": True},
    {"name": "Mix Veg Pakoda", "description": "Assorted vegetable pakodas, hot & crunchy.", "price": 100, "category": "Pakoda", "image_url": img("https://images.unsplash.com/photo-1765360024331-25b63e85272e"), "is_veg": True},
]

SEED_REVIEWS = [
    {"name": "Rahul Das", "rating": 5, "comment": "Best chowmein in Silchar! Fast delivery too."},
    {"name": "Priya Sen", "rating": 5, "comment": "Loved the Paneer Butter Masala. Truly Good Food Good Mood!"},
    {"name": "Amit Roy", "rating": 4, "comment": "Great party arrangement for my son's birthday. Highly recommend."},
]


@app.on_event("startup")
async def seed():
    if await db.menu.count_documents({}) == 0:
        for m in SEED_MENU:
            m.setdefault("is_bestseller", False)
            m.setdefault("is_todays_special", False)
            m["available"] = True
            m["id"] = str(uuid.uuid4())
            m["created_at"] = now_utc().isoformat()
        await db.menu.insert_many(SEED_MENU)
    if await db.reviews.count_documents({}) == 0:
        for r in SEED_REVIEWS:
            r["id"] = str(uuid.uuid4())
            r["approved"] = True
            r["created_at"] = now_utc().isoformat()
        await db.reviews.insert_many(SEED_REVIEWS)
    if not await db.settings.find_one({"_id": "config"}):
        await db.settings.update_one({"_id": "config"}, {"$set": DEFAULT_SETTINGS}, upsert=True)


@api.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
