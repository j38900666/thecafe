import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MessageCircle, Truck, Store } from "lucide-react";
import api from "../lib/api";
import { useCart } from "../context/CartContext";
import { CURRENCY } from "../lib/constants";
import { buildWhatsAppMessage, openWhatsApp } from "../lib/whatsapp";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const [settings, setSettings] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("customer") || "{}");
    return {
      customer_name: saved.customer_name || "",
      mobile: saved.mobile || "",
      order_type: "delivery",
      address: saved.address || "",
      payment_method: "cod",
      delivery_instructions: "",
    };
  });

  useEffect(() => {
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <h2 className="font-display text-3xl mb-4">Your cart is empty</h2>
        <button onClick={() => navigate("/menu")} className="bg-primary text-black font-bold px-6 py-3 rounded-full">Browse Menu</button>
      </div>
    );
  }

  const deliveryCharge = form.order_type === "delivery"
    ? (subtotal >= (settings?.free_delivery_above || 99999) ? 0 : (settings?.delivery_charge || 0))
    : 0;
  const packagingCharge = settings?.packaging_charge || 0;
  const total = subtotal + deliveryCharge + packagingCharge;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.customer_name.trim()) return "Please enter your name";
    if (!/^\d{10}$/.test(form.mobile.trim())) return "Please enter a valid 10-digit mobile number";
    if (form.order_type === "delivery" && !form.address.trim()) return "Please enter your delivery address";
    return null;
  };

  const placeOrder = async (viaWhatsApp) => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setSubmitting(true);
    const payload = {
      ...form,
      items: items.map((i) => ({ item_id: i.item_id, name: i.name, price: i.price, qty: i.qty, is_veg: i.is_veg })),
      subtotal,
      delivery_charge: deliveryCharge,
      packaging_charge: packagingCharge,
      total,
    };
    try {
      const res = await api.post("/orders", payload);
      localStorage.setItem("customer", JSON.stringify({ customer_name: form.customer_name, mobile: form.mobile, address: form.address }));
      if (viaWhatsApp) {
        const msg = buildWhatsAppMessage({ ...payload, order_number: res.data.order_number });
        openWhatsApp(msg);
      }
      clear();
      toast.success(`Order ${res.data.order_number} placed successfully!`);
      navigate("/orders", { state: { mobile: form.mobile } });
    } catch {
      toast.error("Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="overline text-primary mb-2">Checkout</div>
      <h1 className="font-display text-4xl font-bold mb-8">Complete Your Order</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-display text-xl">Your Details</h3>
            <Field label="Full Name">
              <input data-testid="checkout-name" value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} className="input" placeholder="e.g. Rahul Das" />
            </Field>
            <Field label="Mobile Number">
              <input data-testid="checkout-mobile" value={form.mobile} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} className="input" placeholder="10-digit number" inputMode="numeric" />
            </Field>
          </div>

          <div className="bg-surface border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-display text-xl">Order Type</h3>
            <div className="grid grid-cols-2 gap-3">
              <button data-testid="order-type-delivery" onClick={() => set("order_type", "delivery")} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${form.order_type === "delivery" ? "border-primary bg-primary/10" : "border-white/10"}`}>
                <Truck size={22} className={form.order_type === "delivery" ? "text-primary" : ""} />
                <span className="font-semibold text-sm">Home Delivery</span>
              </button>
              <button data-testid="order-type-pickup" onClick={() => set("order_type", "pickup")} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${form.order_type === "pickup" ? "border-primary bg-primary/10" : "border-white/10"}`}>
                <Store size={22} className={form.order_type === "pickup" ? "text-primary" : ""} />
                <span className="font-semibold text-sm">Pickup</span>
              </button>
            </div>
            {form.order_type === "delivery" && (
              <Field label="Delivery Address">
                <textarea data-testid="checkout-address" value={form.address} onChange={(e) => set("address", e.target.value)} className="input min-h-[90px]" placeholder="House / Street / Landmark, Silchar" />
              </Field>
            )}
            <Field label="Delivery Instructions (optional)">
              <input data-testid="checkout-instructions" value={form.delivery_instructions} onChange={(e) => set("delivery_instructions", e.target.value)} className="input" placeholder="e.g. Call on arrival, extra spicy" />
            </Field>
          </div>

          <div className="bg-surface border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-display text-xl">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              <button data-testid="payment-cod" onClick={() => set("payment_method", "cod")} className={`p-4 rounded-xl border font-semibold text-sm transition-colors ${form.payment_method === "cod" ? "border-primary bg-primary/10 text-primary" : "border-white/10"}`}>
                Cash on Delivery
              </button>
              <button data-testid="payment-online" onClick={() => set("payment_method", "online")} className={`p-4 rounded-xl border font-semibold text-sm transition-colors ${form.payment_method === "online" ? "border-primary bg-primary/10 text-primary" : "border-white/10"}`}>
                Online (Pay to restaurant)
              </button>
            </div>
            <p className="text-xs text-muted">Delivery & packaging charges will be confirmed by the restaurant.</p>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-white/10 rounded-2xl p-6 sticky top-24">
            <h3 className="font-display text-xl mb-4">Order Summary</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((i) => (
                <div key={i.item_id} className="flex justify-between text-sm">
                  <span className="text-white/80">{i.name} × {i.qty}</span>
                  <span className="font-semibold">{CURRENCY}{i.price * i.qty}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 mt-4 pt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={`${CURRENCY}${subtotal}`} testid="summary-subtotal" />
              {form.order_type === "delivery" && <Row label={deliveryCharge === 0 ? "Delivery (Free)" : "Delivery"} value={`${CURRENCY}${deliveryCharge}`} testid="summary-delivery" />}
              <Row label="Packaging" value={`${CURRENCY}${packagingCharge}`} testid="summary-packaging" />
              <div className="border-t border-white/10 pt-2 flex justify-between text-lg font-extrabold">
                <span>Total</span>
                <span data-testid="summary-total" className="text-primary">{CURRENCY}{total}</span>
              </div>
            </div>

            <button data-testid="place-order-whatsapp-btn" disabled={submitting} onClick={() => placeOrder(true)} className="w-full mt-5 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 transition-colors">
              <MessageCircle size={18} /> Order via WhatsApp
            </button>
            <button data-testid="place-order-btn" disabled={submitting} onClick={() => placeOrder(false)} className="w-full mt-3 bg-primary hover:bg-primaryHover disabled:opacity-60 text-black font-bold py-3.5 rounded-full transition-colors">
              Place Order
            </button>
          </div>
        </div>
      </div>

      <style>{`.input{width:100%;background:#0A0A0A;border:1px solid rgba(255,255,255,0.1);border-radius:0.75rem;padding:0.75rem 1rem;outline:none;transition:border-color .2s}.input:focus{border-color:#F59E0B}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm text-muted mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value, testid }) {
  return (
    <div className="flex justify-between text-white/80">
      <span>{label}</span>
      <span data-testid={testid} className="font-semibold">{value}</span>
    </div>
  );
}
