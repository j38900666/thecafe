"""Backend API tests for The Cafeteria (public + admin endpoints)."""
import os
import io
import time
import uuid
from datetime import datetime, timezone, timedelta

import pytest
import requests
from dotenv import dotenv_values
from pymongo import MongoClient

frontend_env = dotenv_values("/app/frontend/.env")
backend_env = dotenv_values("/app/backend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
MONGO_URL = backend_env.get("MONGO_URL")
DB_NAME = backend_env.get("DB_NAME")

TEST_MOBILE = "9000000001"


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    return s


@pytest.fixture(scope="session")
def admin_token():
    """Inject an admin session directly into Mongo per /app/memory/test_credentials.md."""
    mc = MongoClient(MONGO_URL)
    db = mc[DB_NAME]
    user_id = "user_test_" + uuid.uuid4().hex[:8]
    token = "test_session_" + uuid.uuid4().hex
    db.users.insert_one({
        "user_id": user_id, "email": f"TEST_admin_{user_id}@example.com",
        "name": "TEST Admin", "picture": "", "is_admin": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    db.user_sessions.insert_one({
        "user_id": user_id, "session_token": token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    yield token
    db.user_sessions.delete_many({"user_id": user_id})
    db.users.delete_many({"user_id": user_id})
    mc.close()


@pytest.fixture(scope="session")
def admin_client(admin_token):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {admin_token}"})
    return s


# ---------------- Health / public read endpoints ----------------
class TestPublicReads:
    def test_health(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_menu_seeded(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/menu")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 22, f"expected >=22 seeded items, got {len(items)}"
        it = items[0]
        for k in ("id", "name", "price", "category", "available"):
            assert k in it
        assert "_id" not in it
        assert any(i.get("is_bestseller") for i in items)
        assert any(i.get("is_todays_special") for i in items)

    def test_menu_category_filter(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/menu", params={"category": "Noodles"})
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 2
        assert all(i["category"] == "Noodles" for i in items)

    def test_menu_search_filter(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/menu", params={"search": "chicken"})
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 1
        assert all("chicken" in (i["name"] + i["description"]).lower() for i in items)

    def test_categories(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/categories")
        assert r.status_code == 200
        cats = r.json()
        assert len(cats) == 8
        assert "Noodles" in cats and "Pakoda" in cats

    def test_settings(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/settings")
        assert r.status_code == 200
        d = r.json()
        for k in ("delivery_charge", "packaging_charge", "free_delivery_above",
                  "offer_banner", "party_note"):
            assert k in d, f"missing {k}"
        assert "_id" not in d

    def test_reviews(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/reviews")
        assert r.status_code == 200
        revs = r.json()
        assert len(revs) >= 3
        assert all("name" in x and "rating" in x and "_id" not in x for x in revs)


# ---------------- Orders (public create + lookup by mobile) ----------------
class TestOrders:
    created_ids = []

    def test_create_order_and_lookup(self, api_client):
        menu = api_client.get(f"{BASE_URL}/api/menu").json()
        item = menu[0]
        payload = {
            "customer_name": "TEST Customer",
            "mobile": TEST_MOBILE,
            "order_type": "delivery",
            "address": "TEST Address, Silchar",
            "payment_method": "cod",
            "items": [{"item_id": item["id"], "name": item["name"], "price": item["price"],
                       "qty": 2, "is_veg": item.get("is_veg", True)}],
            "subtotal": item["price"] * 2,
            "delivery_charge": 30,
            "packaging_charge": 15,
            "total": item["price"] * 2 + 45,
        }
        r = api_client.post(f"{BASE_URL}/api/orders", json=payload)
        assert r.status_code == 200, r.text[:300]
        o = r.json()
        assert o["order_number"].startswith("CAF")
        assert o["status"] == "pending"
        assert o["total"] == payload["total"]
        assert "_id" not in o
        TestOrders.created_ids.append(o["id"])

        # verify persistence via mobile lookup
        r2 = api_client.get(f"{BASE_URL}/api/orders", params={"mobile": TEST_MOBILE})
        assert r2.status_code == 200
        nums = [x["order_number"] for x in r2.json()]
        assert o["order_number"] in nums

    def test_orders_requires_mobile(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/orders")
        assert r.status_code == 200
        assert r.json() == []

    def test_create_order_validation(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/orders", json={"customer_name": "x"})
        assert r.status_code == 422


# ---------------- Auth enforcement on admin endpoints ----------------
class TestAuthEnforcement:
    def test_me_unauthenticated(self, api_client):
        assert api_client.get(f"{BASE_URL}/api/auth/me").status_code == 401

    @pytest.mark.parametrize("method,path,kwargs", [
        ("post", "/api/menu", {"json": {"name": "x", "price": 1, "category": "Veg"}}),
        ("put", "/api/menu/does-not-exist", {"json": {"name": "x", "price": 1, "category": "Veg"}}),
        ("delete", "/api/menu/does-not-exist", {}),
        ("get", "/api/orders?admin=true", {}),
        ("put", "/api/orders/xyz/status", {"json": {"status": "delivered"}}),
        ("put", "/api/settings", {"json": {"delivery_charge": 1, "packaging_charge": 1,
                                           "free_delivery_above": 1, "offer_banner": "a",
                                           "party_note": "b"}}),
        ("delete", "/api/reviews/xyz", {}),
        ("post", "/api/upload", {"files": {"file": ("a.png", b"123", "image/png")}}),
    ])
    def test_admin_endpoints_require_auth(self, api_client, method, path, kwargs):
        r = getattr(api_client, method)(f"{BASE_URL}{path}", **kwargs)
        assert r.status_code in (401, 403), f"{method} {path} -> {r.status_code}"

    def test_invalid_token_rejected(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/auth/me",
                           headers={"Authorization": "Bearer not-a-real-token"})
        assert r.status_code == 401


# ---------------- Admin flows ----------------
class TestAdminFlows:
    def test_auth_me(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        assert r.json()["is_admin"] is True

    def test_menu_crud(self, admin_client, api_client):
        payload = {"name": "TEST_Item", "description": "TEST desc", "price": 111,
                   "category": "Veg", "image_url": "", "is_veg": True,
                   "is_bestseller": False, "is_todays_special": False, "available": True}
        r = admin_client.post(f"{BASE_URL}/api/menu", json=payload)
        assert r.status_code == 200, r.text[:300]
        created = r.json()
        item_id = created["id"]
        assert created["name"] == "TEST_Item" and created["price"] == 111
        assert "_id" not in created

        # verify in public list
        items = api_client.get(f"{BASE_URL}/api/menu", params={"search": "TEST_Item"}).json()
        assert any(i["id"] == item_id for i in items)

        # update
        upd = dict(payload, name="TEST_Item_Updated", price=222, available=False)
        r = admin_client.put(f"{BASE_URL}/api/menu/{item_id}", json=upd)
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_Item_Updated"
        assert r.json()["price"] == 222

        # unavailable hidden from default list, visible with include_unavailable
        assert not any(i["id"] == item_id for i in
                       api_client.get(f"{BASE_URL}/api/menu").json())
        assert any(i["id"] == item_id for i in api_client.get(
            f"{BASE_URL}/api/menu", params={"include_unavailable": "true"}).json())

        # delete + verify removal
        r = admin_client.delete(f"{BASE_URL}/api/menu/{item_id}")
        assert r.status_code == 200
        assert not any(i["id"] == item_id for i in api_client.get(
            f"{BASE_URL}/api/menu", params={"include_unavailable": "true"}).json())
        assert admin_client.delete(f"{BASE_URL}/api/menu/{item_id}").status_code == 404

    def test_upload_image(self, admin_client):
        png = (b"\x89PNG\r\n\x1a\n" + b"0" * 40)
        r = admin_client.post(f"{BASE_URL}/api/upload",
                              files={"file": ("t.png", io.BytesIO(png), "image/png")})
        assert r.status_code == 200, r.text[:300]
        assert r.json()["url"].startswith("data:image/png;base64,")

    def test_admin_orders_and_status_update(self, admin_client, api_client):
        menu = api_client.get(f"{BASE_URL}/api/menu").json()
        item = menu[0]
        r = api_client.post(f"{BASE_URL}/api/orders", json={
            "customer_name": "TEST Status", "mobile": TEST_MOBILE,
            "order_type": "pickup", "payment_method": "cod",
            "items": [{"item_id": item["id"], "name": item["name"],
                       "price": item["price"], "qty": 1}],
            "subtotal": item["price"], "total": item["price"],
        })
        assert r.status_code == 200
        order = r.json()

        allo = admin_client.get(f"{BASE_URL}/api/orders", params={"admin": "true"})
        assert allo.status_code == 200
        assert any(x["id"] == order["id"] for x in allo.json())

        r = admin_client.put(f"{BASE_URL}/api/orders/{order['id']}/status",
                             json={"status": "delivered"})
        assert r.status_code == 200
        found = [x for x in admin_client.get(
            f"{BASE_URL}/api/orders", params={"admin": "true"}).json()
            if x["id"] == order["id"]][0]
        assert found["status"] == "delivered"

        assert admin_client.put(f"{BASE_URL}/api/orders/nope/status",
                                json={"status": "delivered"}).status_code == 404

    def test_settings_update(self, admin_client, api_client):
        original = api_client.get(f"{BASE_URL}/api/settings").json()
        new = {"delivery_charge": 45, "packaging_charge": 20, "free_delivery_above": 600,
               "offer_banner": "TEST banner", "party_note": "TEST party"}
        r = admin_client.put(f"{BASE_URL}/api/settings", json=new)
        assert r.status_code == 200
        got = api_client.get(f"{BASE_URL}/api/settings").json()
        assert got["delivery_charge"] == 45 and got["offer_banner"] == "TEST banner"
        # restore
        restore = {k: original.get(k) for k in new}
        admin_client.put(f"{BASE_URL}/api/settings", json=restore)
        assert api_client.get(f"{BASE_URL}/api/settings").json()["delivery_charge"] == original["delivery_charge"]

    def test_review_create_and_delete(self, admin_client, api_client):
        r = api_client.post(f"{BASE_URL}/api/reviews",
                            json={"name": "TEST Reviewer", "rating": 5, "comment": "TEST"})
        assert r.status_code == 200
        rid = r.json()["id"]
        assert any(x["id"] == rid for x in api_client.get(f"{BASE_URL}/api/reviews").json())
        assert admin_client.delete(f"{BASE_URL}/api/reviews/{rid}").status_code == 200
        assert not any(x["id"] == rid for x in api_client.get(f"{BASE_URL}/api/reviews").json())


# ---------------- Cleanup of test orders ----------------
@pytest.fixture(scope="session", autouse=True)
def cleanup():
    yield
    mc = MongoClient(MONGO_URL)
    mc[DB_NAME].orders.delete_many({"mobile": TEST_MOBILE})
    mc[DB_NAME].menu.delete_many({"name": {"$regex": "^TEST_"}})
    mc[DB_NAME].reviews.delete_many({"name": {"$regex": "^TEST "}})
    mc.close()
