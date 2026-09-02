import React from "react";
import { Plus, Minus, Star } from "lucide-react";
import { VegBadge } from "./VegBadge";
import { useCart } from "../context/CartContext";
import { CURRENCY, PLACEHOLDER_IMG } from "../lib/constants";

export default function MenuCard({ item }) {
  const { items, addItem, setQty } = useCart();
  const inCart = items.find((i) => i.item_id === item.id);

  return (
    <div
      data-testid={`menu-card-${item.id}`}
      className="group bg-surface rounded-2xl overflow-hidden border border-white/10 flex flex-col hover:border-primary/40 transition-colors duration-300"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={item.image_url || PLACEHOLDER_IMG}
          alt={item.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}
          className="w-full h-full object-cover card-hover-img"
        />
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2 py-1 rounded-md">
          <VegBadge isVeg={item.is_veg} />
        </div>
        {item.is_bestseller && (
          <div className="absolute top-3 right-3 bg-primary text-black text-[10px] font-extrabold px-2 py-1 rounded-full flex items-center gap-1">
            <Star size={11} className="fill-black" /> BESTSELLER
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-tight">{item.name}</h3>
          <span className="text-primary font-extrabold whitespace-nowrap">
            {CURRENCY}
            {item.price}
          </span>
        </div>
        <p className="text-muted text-sm mt-1 line-clamp-2 flex-1">{item.description}</p>
        <div className="mt-4">
          {!inCart ? (
            <button
              data-testid={`add-to-cart-${item.id}`}
              onClick={() => addItem(item)}
              className="w-full bg-primary hover:bg-primaryHover text-black font-bold py-2.5 rounded-full flex items-center justify-center gap-2 transition-colors duration-200"
            >
              <Plus size={16} /> Add to Cart
            </button>
          ) : (
            <div className="flex items-center justify-between bg-elevated rounded-full p-1">
              <button
                data-testid={`decrease-qty-${item.id}`}
                onClick={() => setQty(item.id, inCart.qty - 1)}
                className="w-9 h-9 rounded-full bg-surface hover:bg-black flex items-center justify-center transition-colors"
              >
                <Minus size={16} />
              </button>
              <span data-testid={`qty-${item.id}`} className="font-bold">{inCart.qty}</span>
              <button
                data-testid={`increase-qty-${item.id}`}
                onClick={() => setQty(item.id, inCart.qty + 1)}
                className="w-9 h-9 rounded-full bg-primary text-black flex items-center justify-center transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
