import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, Plus, Pencil, Trash2, Package, UtensilsCrossed, Star, Settings as SettingsIcon, X, Upload, Loader2 } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { BUSINESS, CURRENCY, PLACEHOLDER_IMG } from "../lib/constants";
import { VegBadge } from "../components/VegBadge";

export default function Admin() {
  const { user, loading, logout } = useAuth();

  const login = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/admin/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5">
        <div className="bg-surface border border-white/10 rounded-3xl p-10 max-w-md w-full text-center">
          <img src={BUSINESS.logo} alt="logo" className="h-20 w-20 rounded-full bg-white object-cover mx-auto mb-6" />
          <div className="overline text-primary mb-2">Admin Panel</div>
          <h1 className="font-display text-3xl mb-3">Restaurant Dashboard</h1>
          <p className="text-muted mb-8">Sign in with Google to manage your menu, orders, reviews and settings.</p>
          <button data-testid="admin-google-login-btn" onClick={login} className="w-full bg-white text-black font-bold py-3.5 rounded-full flex items-center justify-center gap-3 hover:bg-neutral-200 transition-colors">
            <img src="https://www.google.com/favicon.ico" alt="g" className="w-5 h-5" /> Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!user.is_admin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5 text-center">
        <div className="bg-surface border border-white/10 rounded-3xl p-10 max-w-md">
          <h1 className="font-display text-2xl mb-3">Access Restricted</h1>
          <p className="text-muted mb-6">Your account ({user.email}) is not authorized as admin.</p>
          <button onClick={logout} className="bg-primary text-black font-bold px-6 py-3 rounded-full">Sign Out</button>
        </div>
      </div>
    );
  }

  return <Dashboard user={user} logout={logout} />;
}

function Dashboard({ user, logout }) {
  const [tab, setTab] = useState("menu");
  const tabs = [
    { id: "menu", label: "Menu", icon: UtensilsCrossed },
    { id: "orders", label: "Orders", icon: Package },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="overline text-primary mb-1">Admin Dashboard</div>
          <h1 className="font-display text-3xl">Welcome, {user.name?.split(" ")[0] || "Admin"}</h1>
        </div>
        <button data-testid="admin-logout-btn" onClick={logout} className="flex items-center gap-2 border border-white/15 hover:border-red-500 hover:text-red-400 px-5 py-2.5 rounded-full font-semibold transition-colors">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            data-testid={`admin-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-colors ${tab === t.id ? "bg-primary text-black" : "bg-elevated text-white/70"}`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "menu" && <MenuManager />}
      {tab === "orders" && <OrdersManager />}
      {tab === "reviews" && <ReviewsManager />}
      {tab === "settings" && <SettingsManager />}
    </div>
  );
}

// ---------------- Menu Manager ----------------
function MenuManager() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => {
    api.get("/menu", { params: { include_unavailable: true } }).then((r) => setItems(r.data));
    api.get("/categories").then((r) => setCategories(r.data));
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await api.delete(`/menu/${id}`);
    toast.success("Item deleted");
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-display text-2xl">Menu Items ({items.length})</h2>
        <button data-testid="add-item-btn" onClick={() => setEditing({})} className="bg-primary text-black font-bold px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-primaryHover transition-colors">
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.id} data-testid={`admin-item-${it.id}`} className="bg-surface border border-white/10 rounded-xl overflow-hidden flex">
            <img src={it.image_url || PLACEHOLDER_IMG} onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }} alt={it.name} className="w-24 h-full object-cover" />
            <div className="p-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <VegBadge isVeg={it.is_veg} />
                <span className="font-semibold truncate">{it.name}</span>
              </div>
              <div className="text-xs text-muted">{it.category}</div>
              <div className="text-primary font-bold mt-1">{CURRENCY}{it.price}</div>
              <div className="flex gap-2 mt-2">
                {it.is_bestseller && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Bestseller</span>}
                {it.is_todays_special && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Special</span>}
                {!it.available && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Hidden</span>}
              </div>
              <div className="flex gap-2 mt-3">
                <button data-testid={`edit-item-${it.id}`} onClick={() => setEditing(it)} className="text-xs flex items-center gap-1 border border-white/15 hover:border-primary hover:text-primary px-3 py-1.5 rounded-full transition-colors"><Pencil size={13} /> Edit</button>
                <button data-testid={`delete-item-${it.id}`} onClick={() => del(it.id)} className="text-xs flex items-center gap-1 border border-white/15 hover:border-red-500 hover:text-red-400 px-3 py-1.5 rounded-full transition-colors"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && <ItemModal item={editing} categories={categories} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function ItemModal({ item, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: item.name || "",
    description: item.description || "",
    price: item.price || "",
    category: item.category || categories[0] || "",
    image_url: item.image_url || "",
    is_veg: item.is_veg ?? true,
    is_bestseller: item.is_bestseller ?? false,
    is_todays_special: item.is_todays_special ?? false,
    available: item.available ?? true,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      set("image_url", res.data.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name || !form.price || !form.category) { toast.error("Name, price and category are required"); return; }
    setSaving(true);
    const payload = { ...form, price: parseFloat(form.price) };
    try {
      if (item.id) await api.put(`/menu/${item.id}`, payload);
      else await api.post("/menu", payload);
      toast.success(item.id ? "Item updated" : "Item added");
      onSaved();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display text-2xl">{item.id ? "Edit Item" : "Add Item"}</h3>
          <button onClick={onClose} data-testid="item-modal-close"><X size={22} /></button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface border border-white/10 shrink-0 flex items-center justify-center">
              {form.image_url ? <img src={form.image_url} alt="preview" className="w-full h-full object-cover" /> : <span className="text-muted text-xs">No image</span>}
            </div>
            <div className="flex-1">
              <label data-testid="item-image-upload" className="cursor-pointer inline-flex items-center gap-2 border border-white/15 hover:border-primary px-4 py-2 rounded-full text-sm transition-colors">
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={upload} />
              </label>
              <input data-testid="item-image-url" value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="or paste image URL" className="am-input mt-2 text-xs" />
            </div>
          </div>

          <input data-testid="item-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Item name" className="am-input" />
          <textarea data-testid="item-desc" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Description" className="am-input min-h-[70px]" />
          <div className="grid grid-cols-2 gap-3">
            <input data-testid="item-price" value={form.price} onChange={(e) => set("price", e.target.value.replace(/[^\d.]/g, ""))} placeholder="Price" className="am-input" inputMode="decimal" />
            <select data-testid="item-category" value={form.category} onChange={(e) => set("category", e.target.value)} className="am-input">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex gap-4">
            <button data-testid="item-veg-toggle" onClick={() => set("is_veg", true)} className={`flex-1 py-2 rounded-lg border text-sm font-semibold ${form.is_veg ? "border-green-500 text-green-400" : "border-white/10"}`}>Veg</button>
            <button data-testid="item-nonveg-toggle" onClick={() => set("is_veg", false)} className={`flex-1 py-2 rounded-lg border text-sm font-semibold ${!form.is_veg ? "border-red-500 text-red-400" : "border-white/10"}`}>Non-Veg</button>
          </div>

          <div className="space-y-2">
            <Check label="Bestseller" checked={form.is_bestseller} onChange={(v) => set("is_bestseller", v)} testid="item-bestseller" />
            <Check label="Today's Special" checked={form.is_todays_special} onChange={(v) => set("is_todays_special", v)} testid="item-special" />
            <Check label="Available (visible on site)" checked={form.available} onChange={(v) => set("available", v)} testid="item-available" />
          </div>

          <button data-testid="item-save-btn" disabled={saving} onClick={save} className="w-full bg-primary text-black font-bold py-3 rounded-full hover:bg-primaryHover disabled:opacity-60 transition-colors">
            {saving ? "Saving..." : "Save Item"}
          </button>
        </div>
        <style>{`.am-input{width:100%;background:#171717;border:1px solid rgba(255,255,255,0.1);border-radius:0.6rem;padding:0.6rem 0.9rem;outline:none;transition:border-color .2s}.am-input:focus{border-color:#F59E0B}`}</style>
      </div>
    </div>
  );
}

function Check({ label, checked, onChange, testid }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer" data-testid={testid} onClick={() => onChange(!checked)}>
      <span className={`w-5 h-5 rounded border flex items-center justify-center ${checked ? "bg-primary border-primary" : "border-white/30"}`}>
        {checked && <span className="text-black text-xs font-bold">✓</span>}
      </span>
      <span className="text-sm">{label}</span>
    </label>
  );
}

// ---------------- Orders Manager ----------------
const STATUSES = ["pending", "confirmed", "preparing", "out_for_delivery", "completed", "cancelled"];

function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const load = () => api.get("/orders", { params: { admin: true } }).then((r) => setOrders(r.data)).catch(() => toast.error("Failed to load"));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    toast.success("Status updated");
    load();
  };

  return (
    <div>
      <h2 className="font-display text-2xl mb-5">Orders ({orders.length})</h2>
      <div className="space-y-4">
        {orders.length === 0 && <div className="text-muted py-10 text-center">No orders yet.</div>}
        {orders.map((o) => (
          <div key={o.id} data-testid={`admin-order-${o.order_number}`} className="bg-surface border border-white/10 rounded-xl p-5">
            <div className="flex justify-between flex-wrap gap-3">
              <div>
                <div className="font-display text-lg">{o.order_number} · {o.customer_name}</div>
                <div className="text-sm text-muted">{o.mobile} · {o.order_type === "delivery" ? "Delivery" : "Pickup"} · {o.payment_method.toUpperCase()}</div>
                {o.address && <div className="text-sm text-muted mt-1">📍 {o.address}</div>}
                <div className="text-xs text-muted mt-1">{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-primary text-lg">{CURRENCY}{o.total}</div>
                <select data-testid={`order-status-${o.order_number}`} value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="mt-2 bg-elevated border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none">
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {o.items.map((i, idx) => <span key={idx} className="text-white/80">{i.name} ×{i.qty}</span>)}
            </div>
            {o.delivery_instructions && <div className="text-xs text-muted mt-2">Note: {o.delivery_instructions}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Reviews Manager ----------------
function ReviewsManager() {
  const [reviews, setReviews] = useState([]);
  const load = () => api.get("/reviews").then((r) => setReviews(r.data));
  useEffect(() => { load(); }, []);
  const del = async (id) => { await api.delete(`/reviews/${id}`); toast.success("Review deleted"); load(); };

  return (
    <div>
      <h2 className="font-display text-2xl mb-5">Reviews ({reviews.length})</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {reviews.map((r) => (
          <div key={r.id} data-testid={`admin-review-${r.id}`} className="bg-surface border border-white/10 rounded-xl p-5">
            <div className="flex justify-between">
              <div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < r.rating ? "text-primary fill-primary" : "text-white/20"} />)}</div>
              <button data-testid={`delete-review-${r.id}`} onClick={() => del(r.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
            </div>
            <p className="mt-2 text-white/85">&ldquo;{r.comment}&rdquo;</p>
            <div className="mt-2 text-primary font-display">— {r.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Settings Manager ----------------
function SettingsManager() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get("/settings").then((r) => setS(r.data)); }, []);
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const save = async () => {
    try {
      await api.put("/settings", {
        delivery_charge: parseFloat(s.delivery_charge) || 0,
        packaging_charge: parseFloat(s.packaging_charge) || 0,
        free_delivery_above: parseFloat(s.free_delivery_above) || 0,
        offer_banner: s.offer_banner || "",
        party_note: s.party_note || "",
      });
      toast.success("Settings saved");
    } catch { toast.error("Save failed"); }
  };
  if (!s) return null;

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-2xl mb-5">Store Settings</h2>
      <div className="bg-surface border border-white/10 rounded-2xl p-6 space-y-4">
        <L label="Delivery Charge (₹)"><input data-testid="settings-delivery" value={s.delivery_charge} onChange={(e) => set("delivery_charge", e.target.value.replace(/[^\d.]/g, ""))} className="st-input" /></L>
        <L label="Packaging Charge (₹)"><input data-testid="settings-packaging" value={s.packaging_charge} onChange={(e) => set("packaging_charge", e.target.value.replace(/[^\d.]/g, ""))} className="st-input" /></L>
        <L label="Free Delivery Above (₹)"><input data-testid="settings-free-above" value={s.free_delivery_above} onChange={(e) => set("free_delivery_above", e.target.value.replace(/[^\d.]/g, ""))} className="st-input" /></L>
        <L label="Offer Banner Text"><input data-testid="settings-offer" value={s.offer_banner} onChange={(e) => set("offer_banner", e.target.value)} className="st-input" /></L>
        <L label="Party Booking Note"><textarea data-testid="settings-party" value={s.party_note} onChange={(e) => set("party_note", e.target.value)} className="st-input min-h-[80px]" /></L>
        <button data-testid="settings-save-btn" onClick={save} className="w-full bg-primary text-black font-bold py-3 rounded-full hover:bg-primaryHover transition-colors">Save Settings</button>
      </div>
      <style>{`.st-input{width:100%;background:#0A0A0A;border:1px solid rgba(255,255,255,0.1);border-radius:0.6rem;padding:0.6rem 0.9rem;outline:none;transition:border-color .2s}.st-input:focus{border-color:#F59E0B}`}</style>
    </div>
  );
}

function L({ label, children }) {
  return <label className="block"><span className="text-sm text-muted mb-1.5 block">{label}</span>{children}</label>;
}
