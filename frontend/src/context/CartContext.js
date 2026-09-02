import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    setItems((prev) => {
      const found = prev.find((i) => i.item_id === item.id);
      if (found) {
        return prev.map((i) => (i.item_id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        { item_id: item.id, name: item.name, price: item.price, is_veg: item.is_veg, image_url: item.image_url, qty: 1 },
      ];
    });
  };

  const setQty = (item_id, qty) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.item_id !== item_id) : prev.map((i) => (i.item_id === item_id ? { ...i, qty } : i))
    );
  };

  const removeItem = (item_id) => setItems((prev) => prev.filter((i) => i.item_id !== item_id));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, setQty, removeItem, clear, count, subtotal, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}
