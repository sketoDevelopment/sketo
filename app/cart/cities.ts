export type OrderCity = "astana" | "almaty";

export const orderCities = {
  astana: { phone: "77473835398", name: { ru: "Астана", en: "Astana", kz: "Астана" } },
  almaty: { phone: "77072782028", name: { ru: "Алматы", en: "Almaty", kz: "Алматы" } },
} as const;

export function isOrderCity(value: unknown): value is OrderCity {
  return value === "astana" || value === "almaty";
}

