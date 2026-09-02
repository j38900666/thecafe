import { BUSINESS, CURRENCY } from "./constants";

export function buildWhatsAppMessage({ customer_name, mobile, order_type, address, payment_method, delivery_instructions, items, subtotal, delivery_charge, packaging_charge, total, order_number }) {
  const lines = [];
  lines.push(`*🍽️ ${BUSINESS.name} — New Order*`);
  if (order_number) lines.push(`Order No: *${order_number}*`);
  lines.push("");
  lines.push("*Items:*");
  items.forEach((i, idx) => {
    lines.push(`${idx + 1}. ${i.is_veg ? "🟢" : "🔴"} ${i.name} x${i.qty} — ${CURRENCY}${i.price * i.qty}`);
  });
  lines.push("");
  lines.push(`Subtotal: ${CURRENCY}${subtotal}`);
  if (order_type === "delivery") lines.push(`Delivery: ${CURRENCY}${delivery_charge}`);
  lines.push(`Packaging: ${CURRENCY}${packaging_charge}`);
  lines.push(`*Total: ${CURRENCY}${total}*`);
  lines.push("");
  lines.push("*Customer Details:*");
  lines.push(`Name: ${customer_name}`);
  lines.push(`Mobile: ${mobile}`);
  lines.push(`Type: ${order_type === "delivery" ? "Home Delivery" : "Pickup"}`);
  if (order_type === "delivery" && address) lines.push(`Address: ${address}`);
  lines.push(`Payment: ${payment_method === "cod" ? "Cash on Delivery" : "Online"}`);
  if (delivery_instructions) lines.push(`Note: ${delivery_instructions}`);
  return lines.join("\n");
}

export function openWhatsApp(message) {
  const url = `https://wa.me/${BUSINESS.whatsappIntl}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}
