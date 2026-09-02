import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { VegBadge } from "./VegBadge";
import { CURRENCY } from "../lib/constants";

export default function CartSheet() {
  const { items, open, setOpen, setQty, removeItem, subtotal, count } = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" data-testid="cart-sheet">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-bg border-l border-white/10 flex flex-col animate-[slideUp_0.3s_ease]">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            <h2 className="font-display text-xl">Your Cart ({count})</h2>
          </div>
          <button data-testid="cart-close-btn" onClick={() => setOpen(false)} className="p-2 hover:text-primary transition-colors">
            <X size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted gap-3">
            <ShoppingBag size={48} className="opacity-30" />
            <p>Your cart is empty</p>
            <button
              data-testid="cart-browse-menu-btn"
              onClick={() => { setOpen(false); navigate("/menu"); }}
              className="mt-2 text-primary font-semibold"
            >
              Browse Menu →
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.map((i) => (
                <div key={i.item_id} data-testid={`cart-item-${i.item_id}`} className="flex gap-3 bg-surface rounded-xl p-3 border border-white/5">
                  <img src={i.image_url} alt={i.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <VegBadge isVeg={i.is_veg} />
                      <span className="font-semibold truncate">{i.name}</span>
                    </div>
                    <div className="text-primary font-bold text-sm mt-1">{CURRENCY}{i.price}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2 bg-elevated rounded-full p-0.5">
                        <button data-testid={`cart-dec-${i.item_id}`} onClick={() => setQty(i.item_id, i.qty - 1)} className="w-7 h-7 rounded-full bg-surface flex items-center justify-center">
                          <Minus size={14} />
                        </button>
                        <span className="w-5 text-center text-sm font-bold">{i.qty}</span>
                        <button data-testid={`cart-inc-${i.item_id}`} onClick={() => setQty(i.item_id, i.qty + 1)} className="w-7 h-7 rounded-full bg-primary text-black flex items-center justify-center">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button data-testid={`cart-remove-${i.item_id}`} onClick={() => removeItem(i.item_id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="font-bold text-sm whitespace-nowrap">{CURRENCY}{i.price * i.qty}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 p-5">
              <div className="flex justify-between text-lg font-bold mb-1">
                <span>Subtotal</span>
                <span data-testid="cart-subtotal">{CURRENCY}{subtotal}</span>
              </div>
              <p className="text-xs text-muted mb-4">Delivery & packaging charges calculated at checkout.</p>
              <button
                data-testid="cart-checkout-btn"
                onClick={() => { setOpen(false); navigate("/checkout"); }}
                className="w-full bg-primary hover:bg-primaryHover text-black font-extrabold py-3.5 rounded-full transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
