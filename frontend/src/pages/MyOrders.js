import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Search, RotateCcw, Package } from "lucide-react";
import api from "../lib/api";
import { useCart } from "../context/CartContext";
import { CURRENCY } from "../lib/constants";
import { VegBadge } from "../components/VegBadge";

const STATUS_COLORS = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  preparing: "bg-orange-500/20 text-orange-400",
  out_for_delivery: "bg-purple-500/20 text-purple-400",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function MyOrders() {
  const location = useLocation();
  const { addItem, setOpen } = useCart();
  const [mobile, setMobile] = useState(location.state?.mobile || localStorage.getItem("lastMobile") || "");
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);

  const fetchOrders = async (m) => {
    if (!/^\d{10}$/.test(m)) { toast.error("Enter a valid 10-digit mobile number"); return; }
    try {
      const res = await api.get("/orders", { params: { mobile: m } });
      setOrders(res.data);
      setSearched(true);
      localStorage.setItem("lastMobile", m);
    } catch {
      toast.error("Could not fetch orders");
    }
  };

  useEffect(() => {
    if (mobile && /^\d{10}$/.test(mobile)) fetchOrders(mobile);
    // eslint-disable-next-line
  }, []);

  const reorder = (order) => {
    order.items.forEach((i) => addItem({ id: i.item_id, name: i.name, price: i.price, is_veg: i.is_veg, image_url: i.image_url || "" }));
    toast.success("Items added to cart");
    setOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="overline text-primary mb-2">Track & Reorder</div>
      <h1 className="font-display text-4xl font-bold">My Orders</h1>
      <p className="text-muted mt-2">Enter your mobile number to view past orders and reorder in one click.</p>

      <div className="mt-6 flex gap-3 max-w-md">
        <input
          data-testid="orders-mobile-input"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit mobile number"
          className="flex-1 bg-surface border border-white/10 rounded-full px-5 py-3 outline-none focus:border-primary transition-colors"
          inputMode="numeric"
        />
        <button data-testid="orders-search-btn" onClick={() => fetchOrders(mobile)} className="bg-primary text-black font-bold px-6 rounded-full flex items-center gap-2 transition-colors hover:bg-primaryHover">
          <Search size={18} /> Find
        </button>
      </div>

      <div className="mt-8 space-y-5">
        {searched && orders.length === 0 && (
          <div className="text-center py-16 text-muted">
            <Package size={44} className="mx-auto opacity-30 mb-3" />
            No orders found for this number.
          </div>
        )}
        {orders.map((o) => (
          <div key={o.id} data-testid={`order-${o.order_number}`} className="bg-surface border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="font-display text-lg">{o.order_number}</div>
                <div className="text-xs text-muted">{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase ${STATUS_COLORS[o.status] || "bg-white/10"}`}>
                {o.status.replace(/_/g, " ")}
              </span>
            </div>
            <div className="mt-4 space-y-1.5">
              {o.items.map((i, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <VegBadge isVeg={i.is_veg} />
                  <span className="flex-1">{i.name} × {i.qty}</span>
                  <span className="font-semibold">{CURRENCY}{i.price * i.qty}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="text-sm text-muted">{o.order_type === "delivery" ? "Home Delivery" : "Pickup"} · {o.payment_method === "cod" ? "COD" : "Online"}</div>
              <div className="flex items-center gap-4">
                <span className="font-extrabold text-primary">{CURRENCY}{o.total}</span>
                <button data-testid={`reorder-${o.order_number}`} onClick={() => reorder(o)} className="flex items-center gap-1.5 text-sm font-semibold border border-white/15 hover:border-primary hover:text-primary px-4 py-2 rounded-full transition-colors">
                  <RotateCcw size={15} /> Reorder
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
