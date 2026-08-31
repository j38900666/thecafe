from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
import base64
import logging
import jwt
from datetime import datetime, timezone, timedelta

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = 'HS256'
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def new_id():
    return str(uuid.uuid4())


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------- Menu seed data (source of truth: uploaded HTML) ----------
SEED = [
    ("Drinks & Juices", [
        ("Tea", 20, "tea"), ("Black Coffee", 25, "blackcoffee"), ("Coffee", 35, "cappuccino"),
        ("Cold Coffee", 50, "icedcoffee"), ("Lassi", 40, "lassi"), ("Watermelon Juice", 60, "watermelon"),
        ("Mango Juice", 70, "mango"), ("Mango Milkshake", 80, "milkshake"), ("Orange Juice", 60, "orange"),
        ("Lemon Soda", 40, "lemonade"), ("Banana Juice", 40, "smoothie"), ("Banana Milkshake", 70, "milkshake"),
        ("Pomegranate Juice", 80, "pomegranate"), ("Mix Juice", 90, "juice"),
    ]),
    ("Starters", [
        ("French Fry", 50, "fries"), ("Peri Peri French Fry", 65, "fries"), ("Mushroom 65", 120, "mushrooms"),
        ("Chilli Mushroom Dry", 100, "mushroom"), ("Egg Roll", 70, "eggroll"), ("Chicken Roll", 100, "wrap"),
        ("Paneer Roll", 90, "wrap"), ("Veg Roll", 60, "wrap"), ("Veg Momo Steam", 40, "momo"),
        ("Veg Momo Fry", 60, "momo"), ("Chicken Momo Steam", 50, "momo"), ("Chicken Momo Fry", 70, "dumplings"),
        ("Veg Burger", 70, "burger"), ("Chicken Burger", 100, "burger"), ("Paneer Sandwich", 80, "sandwich"),
        ("Chicken Sandwich", 100, "sandwich"), ("Red Sauce Pasta", 80, "pasta"), ("White Sauce Pasta", 100, "pasta"),
    ]),
    ("Noodles", [
        ("Veg Hakka", 80, "noodles"), ("Veg Schezwan Hakka", 100, "noodles"), ("Veg Singapore", 90, "noodles"),
        ("Veg Schezwan Singapore", 100, "noodles"), ("Chicken Hakka", 120, "noodles"),
        ("Chicken Schezwan Hakka", 140, "noodles"), ("Mix Hakka", 150, "chowmein"),
        ("Mix Schezwan Hakka", 170, "chowmein"), ("Egg Hakka", 100, "noodles"), ("Egg Schezwan Hakka", 120, "noodles"),
    ]),
    ("Fried Rice", [
        ("Chicken Fried Rice", 160, "friedrice"), ("Chicken Schezwan Fried Rice", 180, "friedrice"),
        ("Egg Fried Rice", 140, "friedrice"), ("Egg Schezwan Fried Rice", 160, "friedrice"),
        ("Paneer Fried Rice", 150, "friedrice"), ("Paneer Schezwan Fried Rice", 170, "friedrice"),
        ("Veg Fried Rice", 130, "friedrice"), ("Mix Fried Rice", 180, "friedrice"),
        ("Steam Rice", 90, "rice"), ("Jeera Rice", 130, "rice"), ("Veg Pulao", 150, "pulao"),
        ("Paneer Pulao", 170, "pulao"), ("Chicken Pulao", 190, "pulao"),
    ]),
    ("Veg", [
        ("Green Salad", 70, "salad"), ("Yellow Dal Fry", 80, "dal"), ("Butter Dal Fry", 120, "dalmakhani"),
        ("Mix Veg", 150, "curry"), ("Kadai Paneer", 180, "paneer"), ("Paneer Da Piazza", 220, "paneer"),
        ("Butter Paneer", 210, "paneer"), ("Butter Paneer Masala", 230, "paneer"), ("Paneer Masala", 180, "paneer"),
        ("Aloo Paneer Masala", 170, "paneer"), ("Aloo Dum", 130, "curry"), ("Paneer Manchurian", 150, "manchurian"),
        ("Chilli Paneer Dry", 150, "paneer"), ("Chilli Paneer Gravy", 180, "paneer"),
        ("Chilli Mushroom Dry", 130, "mushroom"), ("Chilli Mushroom Gravy", 150, "mushroom"),
        ("Veg Manchurian", 100, "manchurian"), ("Paneer Biryani", 180, "biryani"), ("Veg Biryani", 140, "biryani"),
    ]),
    ("Roti's", [
        ("Plain Roti", 15, "roti"), ("Butter Roti", 25, "naan"),
    ]),
    ("Non-Veg", [
        ("Chicken Patiala", 250, "curry"), ("Chicken Sultana Boneless", 230, "curry"),
        ("Chicken Kosha", 170, "curry"), ("Chicken Angara Boneless", 220, "curry"),
        ("Chicken Masala", 180, "chickencurry"), ("Chicken Borta", 200, "chickencurry"),
        ("Chicken Do Piaza", 200, "chickencurry"), ("Chicken Jal Piaza", 180, "chickencurry"),
        ("Chicken Butter Masala", 210, "butterchicken"), ("Chicken Curry", 160, "chickencurry"),
        ("Karai Chicken", 210, "karahi"), ("Garlic Chicken", 180, "chicken"),
        ("Chilli Chicken Gravy", 180, "chillichicken"), ("Lemon Chicken", 180, "chicken"),
        ("Chicken Manchurian Boneless", 170, "manchurian"), ("Chicken Biryani", 220, "biryani"),
        ("Egg Biryani", 170, "biryani"),
    ]),
    ("Pakoda", [
        ("Chicken 65", 140, "chicken65"), ("Crispy Chicken", 140, "friedchicken"),
        ("Chicken Dry Fry", 130, "friedchicken"), ("Chicken Pakoda", 120, "pakora"),
        ("Egg Pakoda", 80, "pakora"), ("Paneer Pakoda", 100, "pakora"),
        ("Onion Pakoda", 70, "pakora"), ("Veg Pakoda", 60, "pakora"), ("Bread Omelette", 35, "omelette"),
    ]),
]


U = "https://images.unsplash.com/photo-"
IMG_MAP = {
    "tea": [f"{U}1544787219-7f47ccb76574"],
    "blackcoffee": [f"{U}1509042239860-f550ce710b93"],
    "cappuccino": [f"{U}1461023058943-07fcbe16d735"],
    "icedcoffee": [f"{U}1517959105821-eaf2591984ca"],
    "lassi": [f"{U}1626200419199-391ae4be7a41", f"{U}1553787499-6f9133860278"],
    "watermelon": [f"{U}1587049352846-4a222e784d38", f"{U}1563114773-84221bd62daa"],
    "mango": [f"{U}1553279768-865429fa0078", f"{U}1591073113125-e46713c829ed"],
    "milkshake": [f"{U}1577805947697-89e18249d767"],
    "orange": [f"{U}1600271886742-f049cd451bba", f"{U}1613478223719-2ab802602423"],
    "lemonade": [f"{U}1621263764928-df1444c5e859", f"{U}1437418747212-8d9709afab22"],
    "smoothie": [f"{U}1638176066666-ffb2f013c7dd", f"{U}1571771894821-ce9b6c11b08e"],
    "pomegranate": [f"{U}1615478503562-ec2d8aa0e24e", f"{U}1541344999736-83eca272f6fc"],
    "juice": [f"{U}1610970881699-44a5587cabec", f"{U}1600271886742-f049cd451bba"],
    "fries": [f"{U}1573080496219-bb080dd4f877", f"{U}1541592106381-b31e9677c0e5"],
    "mushrooms": [f"{U}1504545102780-26774c1bb073", f"{U}1615485290382-441e4d049cb5"],
    "mushroom": [f"{U}1615485290382-441e4d049cb5", f"{U}1504545102780-26774c1bb073"],
    "eggroll": [f"{U}1626700051175-6818013e1d4f", f"{U}1600850056064-a8b380df8395"],
    "wrap": [f"{U}1600850056064-a8b380df8395", f"{U}1626700051175-6818013e1d4f"],
    "momo": [f"{U}1534422298391-e4f8c172dddb", f"{U}1496116218417-1a781b1c416c"],
    "dumplings": [f"{U}1563245372-f21724e3856d", f"{U}1496116218417-1a781b1c416c"],
    "burger": [f"{U}1568901346375-23c9450c58cd", f"{U}1550547660-d9450f859349"],
    "sandwich": [f"{U}1528735602780-2552fd46c7af", f"{U}1550507992-eb63ffee0847"],
    "pasta": [f"{U}1473093295043-cdd812d0e601", f"{U}1621996346565-e3dbc646d9a9"],
    "noodles": [f"{U}1585032226651-759b368d7246", f"{U}1569718212165-3a8278d5f624", f"{U}1617093727343-374698b1b08d"],
    "chowmein": [f"{U}1617093727343-374698b1b08d", f"{U}1569718212165-3a8278d5f624"],
    "friedrice": [f"{U}1512058564366-18510be2db19", f"{U}1603133872878-684f208fb84b", f"{U}1596797038530-2c107229654b"],
    "rice": [f"{U}1516684732162-798a0062be99", f"{U}1536304993881-ff6e9eefa2a6"],
    "pulao": [f"{U}1596797038530-2c107229654b", f"{U}1563379091339-03b21ab4a4f8"],
    "salad": [f"{U}1512621776951-a57141f2eefd", f"{U}1546069901-ba9599a7e63c"],
    "dal": [f"{U}1547592166-23ac45744acd", f"{U}1585937421612-70a008356fbe"],
    "dalmakhani": [f"{U}1631452180519-c014fe946bc7", f"{U}1547592166-23ac45744acd"],
    "curry": [f"{U}1585937421612-70a008356fbe", f"{U}1565557623262-b51c2513a641", f"{U}1603894584373-5ac82b2ae398", f"{U}1604909052743-94e838986d24"],
    "paneer": [f"{U}1631452180519-c014fe946bc7", f"{U}1585937421612-70a008356fbe"],
    "manchurian": [f"{U}1585937421612-70a008356fbe", f"{U}1603894584373-5ac82b2ae398"],
    "biryani": ["https://images.pexels.com/photos/31537385/pexels-photo-31537385.jpeg?auto=compress&w=640", f"{U}1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=640&q=70"],
    "roti": [f"{U}1589302168068-964664d93dc0", f"{U}1565557623262-b51c2513a641"],
    "naan": [f"{U}1589302168068-964664d93dc0", f"{U}1601050690597-df0568f70950"],
    "chickencurry": [f"{U}1603894584373-5ac82b2ae398", f"{U}1565557623262-b51c2513a641", f"{U}1585937421612-70a008356fbe"],
    "butterchicken": [f"{U}1585937421612-70a008356fbe", f"{U}1603894584373-5ac82b2ae398"],
    "karahi": [f"{U}1604909052743-94e838986d24", f"{U}1585937421612-70a008356fbe"],
    "chicken": [f"{U}1598103442097-8b74394b95c6", f"{U}1562967914-608f82629710"],
    "chillichicken": [f"{U}1603894584373-5ac82b2ae398", f"{U}1565557623262-b51c2513a641"],
    "chicken65": [f"{U}1615937657715-bc7b4b7962c1", f"{U}1569058242253-92a9c755a0ec"],
    "friedchicken": [f"{U}1562967914-608f82629710", f"{U}1569058242253-92a9c755a0ec"],
    "pakora": [f"{U}1601050690597-df0568f70950", f"{U}1601050690117-94f5f6fa8bd7"],
    "omelette": [f"{U}1510693206972-df098062cb71", f"{U}1525351484163-7529414344d8"],
}


async def seed_menu():
    if await db.menu_items.count_documents({}) > 0:
        return
    docs = []
    kw_count = {}
    for cat_idx, (cat, items) in enumerate(SEED):
        for name, price, kw in items:
            urls = IMG_MAP.get(kw, IMG_MAP["curry"])
            idx = kw_count.get(kw, 0)
            kw_count[kw] = idx + 1
            url = urls[idx % len(urls)]
            if "unsplash" in url and "?" not in url:
                url += "?auto=format&fit=crop&w=640&q=70"
            docs.append({
                "id": new_id(), "category": cat, "cat_index": cat_idx, "name": name,
                "price": float(price), "available": True, "image": url,
                "created_at": now_iso(),
            })
    await db.menu_items.insert_many(docs)
    logger.info("Seeded %s menu items", len(docs))


# ---------- Auth ----------
class LoginIn(BaseModel):
    password: str


def create_token():
    payload = {"sub": "admin", "role": "admin",
               "exp": datetime.now(timezone.utc) + timedelta(hours=24)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def require_admin(request: Request):
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload


@api_router.post("/auth/login")
async def login(body: LoginIn, request: Request):
    ip = request.client.host if request.client else "unknown"
    attempt = await db.login_attempts.find_one({"identifier": ip})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = datetime.fromisoformat(attempt["locked_until"])
        if locked_until > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
    if body.password != ADMIN_PASSWORD:
        await db.login_attempts.update_one(
            {"identifier": ip},
            {"$inc": {"count": 1},
             "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True)
        raise HTTPException(status_code=401, detail="Wrong password")
    await db.login_attempts.delete_one({"identifier": ip})
    return {"token": create_token()}


# ---------- Public menu ----------
@api_router.get("/menu")
async def get_menu():
    items = await db.menu_items.find({"available": True}, {"_id": 0}).sort(
        [("cat_index", 1), ("created_at", 1)]).to_list(1000)
    categories = []
    seen = {}
    for it in items:
        if it["category"] not in seen:
            seen[it["category"]] = {"name": it["category"], "items": []}
            categories.append(seen[it["category"]])
        seen[it["category"]]["items"].append(it)
    return {"categories": categories}


# ---------- Orders ----------
class OrderItem(BaseModel):
    name: str
    price: float
    qty: int


class OrderIn(BaseModel):
    name: str
    phone: str
    address: Optional[str] = ""
    note: Optional[str] = ""
    items: List[OrderItem]
    subtotal: float


@api_router.post("/orders")
async def create_order(order: OrderIn):
    doc = order.model_dump()
    doc.update({"id": new_id(), "status": "new", "created_at": now_iso()})
    await db.orders.insert_one(doc)
    return {"ok": True, "order_id": doc["id"]}


@api_router.get("/admin/orders")
async def list_orders(request: Request):
    await require_admin(request)
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"orders": orders}


class OrderStatusIn(BaseModel):
    status: str


@api_router.patch("/admin/orders/{order_id}")
async def update_order_status(order_id: str, body: OrderStatusIn, request: Request):
    await require_admin(request)
    res = await db.orders.update_one({"id": order_id}, {"$set": {"status": body.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"ok": True}


# ---------- Admin menu management ----------
class ItemIn(BaseModel):
    name: str
    price: float
    category: str
    image: Optional[str] = ""
    available: bool = True
    veg: bool = True


@api_router.get("/admin/items")
async def list_items(request: Request):
    await require_admin(request)
    items = await db.menu_items.find({}, {"_id": 0}).sort(
        [("cat_index", 1), ("created_at", 1)]).to_list(2000)
    return {"items": items}


@api_router.post("/admin/items")
async def create_item(body: ItemIn, request: Request):
    await require_admin(request)
    existing = await db.menu_items.find_one({"category": body.category})
    if existing:
        cat_index = existing["cat_index"]
    else:
        cat_index = 100 + len(await db.menu_items.distinct("category"))
    doc = body.model_dump()
    doc.update({"id": new_id(), "cat_index": cat_index, "created_at": now_iso()})
    await db.menu_items.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/items/{item_id}")
async def update_item(item_id: str, body: ItemIn, request: Request):
    await require_admin(request)
    existing = await db.menu_items.find_one({"category": body.category})
    update = body.model_dump()
    if existing:
        update["cat_index"] = existing["cat_index"]
    res = await db.menu_items.update_one({"id": item_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"ok": True}


@api_router.delete("/admin/items/{item_id}")
async def delete_item(item_id: str, request: Request):
    await require_admin(request)
    res = await db.menu_items.delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"ok": True}


class CategoryRenameIn(BaseModel):
    old_name: str
    new_name: str


@api_router.post("/admin/categories/rename")
async def rename_category(body: CategoryRenameIn, request: Request):
    await require_admin(request)
    await db.menu_items.update_many({"category": body.old_name}, {"$set": {"category": body.new_name}})
    return {"ok": True}


@api_router.post("/admin/upload")
async def upload_image(request: Request, file: UploadFile = File(...)):
    await require_admin(request)
    data = await file.read()
    if len(data) > 3 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (max 3MB)")
    b64 = base64.b64encode(data).decode()
    mime = file.content_type or "image/jpeg"
    return {"url": f"data:{mime};base64,{b64}"}


@api_router.get("/")
async def root():
    return {"message": "The Cafeteria API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


NON_VEG_WORDS = ("chicken", "egg", "mutton", "fish", "prawn", "omelette")


def classify_veg(name: str) -> bool:
    n = name.lower()
    return not any(w in n for w in NON_VEG_WORDS)


async def migrate_veg():
    cursor = db.menu_items.find({"veg": {"$exists": False}}, {"id": 1, "name": 1})
    async for it in cursor:
        await db.menu_items.update_one({"id": it["id"]}, {"$set": {"veg": classify_veg(it["name"])}})


@app.on_event("startup")
async def startup():
    await db.menu_items.create_index("id", unique=True)
    await db.login_attempts.create_index("identifier")
    await seed_menu()
    await migrate_veg()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
