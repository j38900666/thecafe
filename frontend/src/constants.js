export const LOGO_URL =
  "https://customer-assets-v7afamib.emergentagent.net/job_the-cafeteria-site/artifacts/lgc150zh_file_0000000073d082119043f11ea6a9ed1e.png";

export const WHATSAPP_URL = "https://wa.me/919101328562";
export const PHONE_TEL = "tel:+918721824729";

export const IMG = {
  hero: "https://images.pexels.com/photos/31537385/pexels-photo-31537385.jpeg?auto=compress&w=1200",
  vibe: "https://images.pexels.com/photos/33472114/pexels-photo-33472114.jpeg?auto=compress&w=1000",
  momos: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=80",
  shake: "https://images.unsplash.com/photo-1653122025865-5e75e63cf4ba?auto=format&fit=crop&w=1000&q=80",
  table: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&w=1000",
};

export const itemFallback = (category = "") => {
  const c = category.toLowerCase();
  if (c.includes("drink") || c.includes("juice")) return IMG.shake;
  if (c.includes("starter")) return IMG.momos;
  return IMG.table;
};

export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
