import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tc_cart") || "{}");
    } catch {
      return {};
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("tc_cart", JSON.stringify(items));
  }, [items]);

  const add = (item) =>
    setItems((p) => ({
      ...p,
      [item.id]: { id: item.id, name: item.name, price: item.price, image: item.image, qty: (p[item.id]?.qty || 0) + 1 },
    }));

  const setQty = (id, qty) =>
    setItems((p) => {
      const n = { ...p };
      if (qty <= 0) delete n[id];
      else n[id] = { ...n[id], qty };
      return n;
    });

  const clear = () => setItems({});

  const { count, subtotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    Object.values(items).forEach((i) => {
      c += i.qty;
      s += i.qty * i.price;
    });
    return { count: c, subtotal: s };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, add, setQty, clear, count, subtotal, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
