import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/api";
import { useCart } from "@/context/CartContext";
import { WHATSAPP_URL } from "@/constants";

export default function CartDrawer() {
  const { items, setQty, clear, subtotal, open, setOpen } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [placing, setPlacing] = useState(false);
  const list = Object.values(items);

  const placeOrder = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please add your name and phone number");
      return;
    }
    setPlacing(true);
    try {
      await api.post("/orders", {
        ...form,
        items: list.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
        subtotal,
      });
      const lines = list.map((i) => `• ${i.name} × ${i.qty} = ₹${i.price * i.qty}`).join("\n");
      const msg = `Hello The Cafeteria, I would like to place an order:\n\n${lines}\n\nSubtotal: ₹${subtotal}\n\nName: ${form.name}\nPhone: ${form.phone}${form.address ? `\nAddress: ${form.address}` : ""}${form.note ? `\nNote: ${form.note}` : ""}\n\n(Delivery & packaging charges to be confirmed by the restaurant.)`;
      window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank");
      toast.success("Order saved — WhatsApp opened to confirm");
      clear();
      setOpen(false);
      setForm({ name: "", phone: "", address: "", note: "" });
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setOpen(false)} className="fixed inset-0 z-[95] bg-caf-ink/50 backdrop-blur-sm" data-testid="cart-overlay" />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 z-[100] flex h-full w-full max-w-md flex-col bg-caf-bg shadow-2xl"
                        data-testid="cart-drawer">
            <div className="flex items-center justify-between border-b border-caf-line px-6 py-5">
              <h2 className="font-serif text-2xl tracking-tight">Your Cart</h2>
              <button onClick={() => setOpen(false)} data-testid="cart-close-btn" className="rounded-full border border-caf-line p-2 transition-colors duration-300 hover:border-caf-brand hover:text-caf-brand" aria-label="Close cart">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {list.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center" data-testid="cart-empty">
                  <p className="font-serif text-2xl text-caf-ink/60">Your cart is empty.</p>
                  <p className="mt-2 text-sm text-caf-ink/50">Add something tasty from the menu.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {list.map((i) => (
                    <div key={i.id} className="flex items-center gap-4" data-testid={`cart-item-${i.id.slice(0, 8)}`}>
                      <img src={i.image} alt={i.name} className="h-16 w-16 rounded-xl border border-caf-line object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-serif text-lg leading-tight">{i.name}</div>
                        <div className="text-xs text-caf-ink/50">₹{i.price} each</div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <button data-testid={`cart-dec-${i.id.slice(0, 8)}`} onClick={() => setQty(i.id, i.qty - 1)} className="rounded-full border border-caf-line p-1 hover:border-caf-brand" aria-label="Decrease">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                          <button data-testid={`cart-inc-${i.id.slice(0, 8)}`} onClick={() => setQty(i.id, i.qty + 1)} className="rounded-full border border-caf-line p-1 hover:border-caf-brand" aria-label="Increase">
                            <Plus className="h-3 w-3" />
                          </button>
                          <button data-testid={`cart-remove-${i.id.slice(0, 8)}`} onClick={() => setQty(i.id, 0)} className="ml-1 text-caf-ink/40 hover:text-red-600" aria-label="Remove">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="font-serif text-lg font-semibold text-caf-brand">₹{i.price * i.qty}</div>
                    </div>
                  ))}

                  <div className="rounded-2xl border border-caf-line bg-white p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium text-caf-ink/60">Subtotal</span>
                      <span className="font-serif text-2xl font-semibold" data-testid="cart-subtotal">₹{subtotal}</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-caf-ink/55">
                      Delivery &amp; packaging charges are <span className="font-semibold text-caf-ink">not included</span> — the
                      restaurant will confirm them when your order is received.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input data-testid="order-name-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                           placeholder="Your name *" className="w-full rounded-xl border border-caf-line bg-white px-4 py-3 text-sm outline-none focus:border-caf-brand" />
                    <input data-testid="order-phone-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                           placeholder="Phone number *" type="tel" className="w-full rounded-xl border border-caf-line bg-white px-4 py-3 text-sm outline-none focus:border-caf-brand" />
                    <input data-testid="order-address-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                           placeholder="Delivery address (optional)" className="w-full rounded-xl border border-caf-line bg-white px-4 py-3 text-sm outline-none focus:border-caf-brand" />
                    <textarea data-testid="order-note-input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                              placeholder="Any note for the kitchen? (optional)" rows={2}
                              className="w-full resize-none rounded-xl border border-caf-line bg-white px-4 py-3 text-sm outline-none focus:border-caf-brand" />
                  </div>
                </div>
              )}
            </div>

            {list.length > 0 && (
              <div className="border-t border-caf-line p-6">
                <button data-testid="place-order-btn" onClick={placeOrder} disabled={placing}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-caf-brand py-4 text-sm font-semibold text-white transition-colors duration-300 hover:bg-caf-ink disabled:opacity-60">
                  {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                  Place Order on WhatsApp — ₹{subtotal}
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
