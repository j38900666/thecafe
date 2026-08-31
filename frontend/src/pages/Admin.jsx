import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Loader2, LogOut, Plus, Pencil, Trash2, X, RefreshCw, Upload, UtensilsCrossed, ClipboardList, Bell, BellOff, Sparkles, Star,
} from "lucide-react";
import { api, authHeaders, formatApiError } from "@/api";
import { LOGO_URL } from "@/constants";

const STATUSES = ["new", "confirmed", "delivered", "cancelled"];

const emptyForm = { name: "", price: "", category: "", image: "", available: true, veg: true, special: false };

function ItemDialog({ open, onClose, onSaved, categories, item }) {
  const [form, setForm] = useState(emptyForm);
  const [newCat, setNewCat] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(item ? { name: item.name, price: item.price, category: item.category, image: item.image, available: item.available, veg: item.veg !== false, special: item.special === true } : { ...emptyForm, category: categories[0] || "" });
      setNewCat("");
    }
  }, [open, item, categories]);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await api.post("/admin/upload", fd, authHeaders());
      setForm((f) => ({ ...f, image: r.data.url }));
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const category = form.category === "__NEW__" ? newCat.trim() : form.category;
    if (!form.name.trim() || !category || form.price === "") {
      toast.error("Name, category and price are required");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, category, price: Number(form.price) };
      if (item) await api.put(`/admin/items/${item.id}`, payload, authHeaders());
      else await api.post("/admin/items", payload, authHeaders());
      toast.success(item ? "Item updated" : "Item added");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-caf-ink/50 p-4 backdrop-blur-sm" data-testid="item-dialog">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-caf-bg p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-serif text-2xl">{item ? "Edit Item" : "Add New Item"}</h3>
          <button onClick={onClose} data-testid="item-dialog-close" className="rounded-full border border-caf-line p-2 hover:border-caf-brand" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-caf-ink/60">Category</label>
            <select data-testid="item-category-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-caf-line bg-white px-4 py-3 text-sm outline-none focus:border-caf-brand">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="__NEW__">+ Create new category</option>
            </select>
            {form.category === "__NEW__" && (
              <input data-testid="item-new-category-input" value={newCat} onChange={(e) => setNewCat(e.target.value)}
                     placeholder="New category name" className="mt-2 w-full rounded-xl border border-caf-line bg-white px-4 py-3 text-sm outline-none focus:border-caf-brand" />
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-caf-ink/60">Item name</label>
            <input data-testid="item-name-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                   className="w-full rounded-xl border border-caf-line bg-white px-4 py-3 text-sm outline-none focus:border-caf-brand" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-caf-ink/60">Price (₹)</label>
            <input data-testid="item-price-input" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                   className="w-full rounded-xl border border-caf-line bg-white px-4 py-3 text-sm outline-none focus:border-caf-brand" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-caf-ink/60">Type</label>
            <select data-testid="item-veg-select" value={form.veg ? "veg" : "nonveg"} onChange={(e) => setForm({ ...form, veg: e.target.value === "veg" })}
                    className="w-full rounded-xl border border-caf-line bg-white px-4 py-3 text-sm outline-none focus:border-caf-brand">
              <option value="veg">Veg</option>
              <option value="nonveg">Non-Veg</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-caf-ink/60">Photo</label>
            {form.image && <img src={form.image} alt="preview" className="mb-2 h-28 w-full rounded-xl border border-caf-line object-cover" />}
            <input data-testid="item-image-input" value={form.image.startsWith("data:") ? "" : form.image}
                   onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Paste image URL…"
                   className="w-full rounded-xl border border-caf-line bg-white px-4 py-3 text-sm outline-none focus:border-caf-brand" />
            <label data-testid="item-upload-btn"
                   className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-caf-line bg-white px-4 py-3 text-sm text-caf-ink/60 hover:border-caf-brand">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading…" : "…or upload a photo from your device"}
              <input type="file" accept="image/*" className="hidden" onChange={upload} />
            </label>
          </div>
          <label className="flex items-center gap-3 text-sm" data-testid="item-available-toggle">
            <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })}
                   className="h-4 w-4 accent-caf-brand" />
            Available on the menu
          </label>
          <label className="flex items-center gap-3 text-sm" data-testid="item-special-toggle">
            <input type="checkbox" checked={!!form.special} onChange={(e) => setForm({ ...form, special: e.target.checked })}
                   className="h-4 w-4 accent-caf-amber" />
            Today&apos;s Special (featured at the top of the site)
          </label>
          <button data-testid="item-save-btn" onClick={save} disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-caf-brand py-3.5 text-sm font-semibold text-white hover:bg-caf-ink disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} {item ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function OrdersTab({ refreshKey }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/admin/orders", authHeaders());
      setOrders(r.data.orders);
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}`, { status }, authHeaders());
      setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
      toast.success(`Marked ${status}`);
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-caf-brand" /></div>;
  if (!orders.length) return <p className="py-16 text-center text-caf-ink/50" data-testid="orders-empty">No orders yet. New orders placed from the cart will appear here.</p>;

  return (
    <div className="space-y-4" data-testid="orders-list">
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-caf-line bg-white p-5" data-testid={`order-${o.id.slice(0, 8)}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-serif text-xl">{o.name} <span className="text-sm text-caf-ink/50">• {o.phone}</span></div>
              {o.address && <div className="text-xs text-caf-ink/55">{o.address}</div>}
              <div className="mt-0.5 text-xs text-caf-ink/40">{new Date(o.created_at).toLocaleString()}</div>
            </div>
            <select data-testid={`order-status-${o.id.slice(0, 8)}`} value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider outline-none ${
                      o.status === "new" ? "border-caf-amber text-caf-amber" : o.status === "cancelled" ? "border-red-400 text-red-500" : "border-caf-olive text-caf-olive"
                    }`}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="mt-3 space-y-1 border-t border-caf-line pt-3 text-sm">
            {o.items.map((i, idx) => (
              <div key={idx} className="flex justify-between"><span>{i.name} × {i.qty}</span><span>₹{i.price * i.qty}</span></div>
            ))}
            <div className="flex justify-between border-t border-dashed border-caf-line pt-2 font-serif text-lg font-semibold">
              <span>Subtotal</span><span className="text-caf-brand">₹{o.subtotal}</span>
            </div>
            <p className="text-xs italic text-caf-ink/45">Delivery &amp; packaging charges to be confirmed manually.</p>
            {o.note && <p className="text-xs text-caf-ink/60">Note: {o.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [catFilter, setCatFilter] = useState("all");
  const [renameOpen, setRenameOpen] = useState(false);
  const [rename, setRename] = useState({ old: "", new: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/admin/items", authHeaders());
      setItems(r.data.items);
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))], [items]);
  const visible = useMemo(() => (catFilter === "all" ? items : items.filter((i) => i.category === catFilter)), [items, catFilter]);

  const toggleAvail = async (item) => {
    try {
      await api.put(`/admin/items/${item.id}`, { name: item.name, price: item.price, category: item.category, image: item.image, available: !item.available, veg: item.veg !== false, special: item.special === true }, authHeaders());
      setItems((list) => list.map((x) => (x.id === item.id ? { ...x, available: !x.available } : x)));
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const toggleSpecial = async (item) => {
    try {
      const next = !(item.special === true);
      await api.put(`/admin/items/${item.id}`, { name: item.name, price: item.price, category: item.category, image: item.image, available: item.available, veg: item.veg !== false, special: next }, authHeaders());
      setItems((list) => list.map((x) => (x.id === item.id ? { ...x, special: next } : x)));
      toast.success(next ? `${item.name} is today's special` : `${item.name} removed from specials`);
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const [genId, setGenId] = useState(null);
  const generatePhoto = async (item) => {
    setGenId(item.id);
    try {
      const r = await api.post(`/admin/items/${item.id}/generate-image`, {}, { ...authHeaders(), timeout: 120000 });
      setItems((list) => list.map((x) => (x.id === item.id ? { ...x, image: r.data.image } : x)));
      toast.success(`AI photo ready for ${item.name}`);
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setGenId(null);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.name}" permanently?`)) return;
    try {
      await api.delete(`/admin/items/${item.id}`, authHeaders());
      setItems((list) => list.filter((x) => x.id !== item.id));
      toast.success("Item deleted");
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const doRename = async () => {
    if (!rename.old || !rename.new.trim()) return;
    try {
      await api.post("/admin/categories/rename", { old_name: rename.old, new_name: rename.new.trim() }, authHeaders());
      toast.success("Category renamed");
      setRenameOpen(false);
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select data-testid="admin-category-filter" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                className="rounded-full border border-caf-line bg-white px-4 py-2.5 text-sm outline-none focus:border-caf-brand">
          <option value="all">{`All categories (${items.length})`}</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button data-testid="add-item-btn" onClick={() => { setEditing(null); setDialogOpen(true); }}
                className="flex items-center gap-2 rounded-full bg-caf-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-caf-ink">
          <Plus className="h-4 w-4" /> Add Item
        </button>
        <button data-testid="rename-category-btn" onClick={() => { setRename({ old: categories[0] || "", new: "" }); setRenameOpen(true); }}
                className="flex items-center gap-2 rounded-full border border-caf-line px-5 py-2.5 text-sm hover:border-caf-brand hover:text-caf-brand">
          <Pencil className="h-3.5 w-3.5" /> Rename Category
        </button>
        <button data-testid="refresh-items-btn" onClick={load} className="rounded-full border border-caf-line p-2.5 hover:border-caf-brand" aria-label="Refresh">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-caf-brand" /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-caf-line bg-white" data-testid="items-table">
          {visible.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border-b border-caf-line p-3.5 last:border-0" data-testid={`admin-item-${item.id.slice(0, 8)}`}>
              <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl border border-caf-line object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{item.name}</div>
                <div className="text-xs text-caf-ink/50">{item.category} • ₹{item.price}</div>
              </div>
              <button data-testid={`toggle-available-${item.id.slice(0, 8)}`} onClick={() => toggleAvail(item)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${item.available ? "bg-caf-olive/15 text-caf-olive" : "bg-red-100 text-red-500"}`}>
                {item.available ? "Available" : "Hidden"}
              </button>
              <button data-testid={`toggle-special-${item.id.slice(0, 8)}`} onClick={() => toggleSpecial(item)}
                      title={item.special ? "Remove from Today's Specials" : "Mark as Today's Special"} aria-label="Toggle special"
                      className={`rounded-full border p-2 transition-colors duration-300 ${item.special ? "border-caf-amber text-caf-amber" : "border-caf-line hover:border-caf-amber hover:text-caf-amber"}`}>
                <Star className="h-3.5 w-3.5" fill={item.special ? "currentColor" : "none"} />
              </button>
              <button data-testid={`generate-photo-${item.id.slice(0, 8)}`} onClick={() => generatePhoto(item)} disabled={genId === item.id}
                      title="Generate AI photo" aria-label="Generate AI photo"
                      className="rounded-full border border-caf-line p-2 transition-colors duration-300 hover:border-caf-amber hover:text-caf-amber disabled:opacity-60">
                {genId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              </button>
              <button data-testid={`edit-item-${item.id.slice(0, 8)}`} onClick={() => { setEditing(item); setDialogOpen(true); }}
                      className="rounded-full border border-caf-line p-2 hover:border-caf-brand hover:text-caf-brand" aria-label="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button data-testid={`delete-item-${item.id.slice(0, 8)}`} onClick={() => remove(item)}
                      className="rounded-full border border-caf-line p-2 hover:border-red-400 hover:text-red-500" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {!visible.length && <p className="p-10 text-center text-sm text-caf-ink/50">No items in this category.</p>}
        </div>
      )}

      <ItemDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} categories={categories} item={editing} />

      <AnimatePresence>
        {renameOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-caf-ink/50 p-4 backdrop-blur-sm" data-testid="rename-dialog">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="w-full max-w-sm rounded-3xl bg-caf-bg p-6 shadow-2xl">
              <h3 className="mb-4 font-serif text-2xl">Rename Category</h3>
              <select data-testid="rename-from-select" value={rename.old} onChange={(e) => setRename({ ...rename, old: e.target.value })}
                      className="mb-3 w-full rounded-xl border border-caf-line bg-white px-4 py-3 text-sm outline-none">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input data-testid="rename-to-input" value={rename.new} onChange={(e) => setRename({ ...rename, new: e.target.value })}
                     placeholder="New category name" className="mb-4 w-full rounded-xl border border-caf-line bg-white px-4 py-3 text-sm outline-none focus:border-caf-brand" />
              <div className="flex gap-2">
                <button data-testid="rename-save-btn" onClick={doRename} className="flex-1 rounded-full bg-caf-brand py-3 text-sm font-semibold text-white hover:bg-caf-ink">Rename</button>
                <button data-testid="rename-cancel-btn" onClick={() => setRenameOpen(false)} className="rounded-full border border-caf-line px-5 py-3 text-sm">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("tc_admin_token") || "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("orders");
  const [alertsOn, setAlertsOn] = useState(localStorage.getItem("tc_alerts") === "1");
  const [ordersBump, setOrdersBump] = useState(0);
  const latestOrderRef = useRef(null);

  const ding = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [784, 1046].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.value = freq;
        const t = ctx.currentTime + i * 0.18;
        g.gain.setValueAtTime(0.001, t);
        g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        o.start(t);
        o.stop(t + 0.32);
      });
    } catch { /* audio blocked */ }
  };

  const toggleAlerts = async () => {
    if (alertsOn) {
      localStorage.setItem("tc_alerts", "0");
      setAlertsOn(false);
      toast.success("Order alerts turned off");
      return;
    }
    if (!("Notification" in window)) {
      toast.error("This browser does not support notifications");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      localStorage.setItem("tc_alerts", "1");
      setAlertsOn(true);
      ding();
      toast.success("Order alerts on — keep this tab open in the background");
    } else {
      toast.error("Notification permission blocked — enable it in browser settings");
    }
  };

  useEffect(() => {
    if (!token) return;
    let stop = false;
    const poll = async () => {
      try {
        const r = await api.get("/admin/orders", authHeaders());
        if (stop) return;
        const orders = r.data.orders;
        const newest = orders[0]?.id || null;
        if (latestOrderRef.current === null) {
          latestOrderRef.current = newest;
          return;
        }
        if (newest && newest !== latestOrderRef.current) {
          const fresh = [];
          for (const o of orders) {
            if (o.id === latestOrderRef.current) break;
            fresh.push(o);
          }
          latestOrderRef.current = newest;
          setOrdersBump((b) => b + 1);
          const o = fresh[0];
          if (alertsOn) {
            ding();
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("New order at The Cafeteria", {
                body: `${o.name} • ₹${o.subtotal} • ${o.items.length} item(s)`,
              });
            }
          }
          toast.success(`New order: ${o.name} — ₹${o.subtotal}`, { duration: 10000 });
        }
      } catch { /* keep polling */ }
    };
    poll();
    const t = setInterval(poll, 20000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [token, alertsOn]);

  const login = async () => {
    setBusy(true);
    try {
      const r = await api.post("/auth/login", { password });
      localStorage.setItem("tc_admin_token", r.data.token);
      setToken(r.data.token);
      toast.success("Welcome back, chef");
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("tc_admin_token");
    setToken("");
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-caf-bg px-4" data-testid="admin-login-page">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-sm rounded-3xl border border-caf-line bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <img src={LOGO_URL} alt="The Cafeteria" className="mx-auto mb-3 h-16 w-16 rounded-full object-cover ring-1 ring-caf-line" />
            <h1 className="font-serif text-3xl tracking-tight">Admin Panel</h1>
            <p className="mt-1 text-sm text-caf-ink/55">The Cafeteria — Good Food • Good Mood</p>
          </div>
          <input data-testid="admin-password-input" type="password" value={password}
                 onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()}
                 placeholder="Admin password"
                 className="mb-4 w-full rounded-xl border border-caf-line bg-caf-bg px-4 py-3.5 text-sm outline-none focus:border-caf-brand" />
          <button data-testid="admin-login-btn" onClick={login} disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-caf-brand py-3.5 text-sm font-semibold text-white hover:bg-caf-ink disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Log In
          </button>
          <Link to="/" data-testid="admin-back-home" className="mt-4 block text-center text-xs text-caf-ink/45 hover:text-caf-brand">
            ← Back to the menu
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-caf-bg" data-testid="admin-dashboard">
      <header className="sticky top-0 z-40 border-b border-caf-line bg-caf-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="The Cafeteria" className="h-10 w-10 rounded-full object-cover ring-1 ring-caf-line" />
            <div>
              <div className="font-serif text-xl font-semibold leading-tight">The Cafeteria</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-caf-brand">Admin Panel</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button data-testid="alerts-toggle-btn" onClick={toggleAlerts} title={alertsOn ? "Order alerts on" : "Enable order alerts"}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${alertsOn ? "bg-caf-brand text-white" : "border border-caf-line hover:border-caf-brand"}`}>
              {alertsOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              <span className="hidden sm:inline">{alertsOn ? "Alerts On" : "Enable Alerts"}</span>
            </button>
            <button data-testid="tab-orders" onClick={() => setTab("orders")}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${tab === "orders" ? "bg-caf-ink text-white" : "border border-caf-line hover:border-caf-brand"}`}>
              <ClipboardList className="h-4 w-4" /> Orders
            </button>
            <button data-testid="tab-menu" onClick={() => setTab("menu")}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${tab === "menu" ? "bg-caf-ink text-white" : "border border-caf-line hover:border-caf-brand"}`}>
              <UtensilsCrossed className="h-4 w-4" /> Menu
            </button>
            <Link to="/" data-testid="admin-view-site" className="rounded-full border border-caf-line px-4 py-2 text-sm hover:border-caf-brand hover:text-caf-brand">View Site</Link>
            <button data-testid="admin-logout-btn" onClick={logout} className="rounded-full border border-caf-line p-2 hover:border-red-400 hover:text-red-500" aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {tab === "orders" ? <OrdersTab refreshKey={ordersBump} /> : <MenuTab />}
      </main>
    </div>
  );
}
