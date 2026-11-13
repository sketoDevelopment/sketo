import type { Language } from "../components/language";

export type CartProduct = {
  kind: "coffee" | "accessory" | "equipment";
  slug: string;
  sku?: string;
  variantId?: string;
  volumeId?: string;
  href: string;
  image: string;
  // Integer minor units. null means a price must be confirmed, never free.
  unitPrice: number | null;
  equipmentPriceEur?: string | null;
  priceFrom?: boolean;
  content: Record<Language, { name: string; detail: string }>;
};
export type CartLine = CartProduct & { quantity: number };
export const MAX_QUANTITY = 99;
export const MAX_LINES = 100;
export const cartKey = (item: CartProduct) => JSON.stringify([item.kind, item.slug, item.variantId ?? "", item.volumeId ?? ""]);
export const localizeProduct = (make: (language: Language) => CartProduct["content"][Language]): CartProduct["content"] => ({ ru: make("ru"), en: make("en"), kz: make("kz") });

export function parseKztPrice(display: string): number | null {
  const match = display.trim().match(/^KZT\s*([\d,]+)(?:\.(\d{1,2}))?$/i);
  if (!match || !/^\d+(?:,\d{3})*$/.test(match[1])) return null;
  return toMinorUnits(match[1].replaceAll(",", "") + (match[2] ? `.${match[2]}` : ""));
}
export function toMinorUnits(value: string | null): number | null {
  if (value === null || !/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return null;
  const price = Math.round(Number(value) * 100);
  return Number.isSafeInteger(price) && price >= 0 && price <= 1e12 ? price : null;
}
export function addLine(lines: CartLine[], item: CartProduct): CartLine[] {
  const key = cartKey(item);
  const existing = lines.find(line => cartKey(line) === key);
  if (existing) return lines.map(line => cartKey(line) === key ? { ...item, quantity: Math.min(line.quantity + 1, MAX_QUANTITY) } : line);
  return lines.length >= MAX_LINES ? lines : [...lines, { ...item, quantity: 1 }];
}
export function setQuantity(lines: CartLine[], key: string, quantity: number): CartLine[] {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return lines;
  return lines.map(line => cartKey(line) === key ? { ...line, quantity } : line);
}
export function cartTotals(lines: CartLine[]) {
  return { count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + (line.unitPrice ?? 0) * line.quantity, 0),
    needsQuote: lines.some(line => line.unitPrice === null),
    priceFrom: lines.some(line => line.unitPrice !== null && line.priceFrom === true) };
}
export function decodeCart(raw: string | null): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? "null");
    if (!parsed || typeof parsed !== "object" || !("version" in parsed) || parsed.version !== 1 || !("lines" in parsed) || !Array.isArray(parsed.lines)) return [];
    const seen = new Set<string>();
    return parsed.lines.slice(0, MAX_LINES).filter((item): item is CartLine => {
      if (!item || typeof item !== "object" || !["coffee", "accessory", "equipment"].includes(item.kind)) return false;
      if (typeof item.slug !== "string" || !item.slug || item.slug.length > 200) return false;
      if (item.sku !== undefined && (typeof item.sku !== "string" || item.sku.length > 200)) return false;
      if (![item.variantId, item.volumeId].every(id => id === undefined || (typeof id === "string" && id.length <= 200))) return false;
      if (typeof item.href !== "string" || !/^\/(catalog|equipment|accessories)\/[a-zA-Z0-9%_-]+$/.test(item.href)) return false;
      if (typeof item.image !== "string" || item.image.length > 2048 || !/^(\/(?!\/)|https:\/\/)/.test(item.image)) return false;
      if (item.unitPrice !== null && (!Number.isSafeInteger(item.unitPrice) || item.unitPrice < 0 || item.unitPrice > 1e12)) return false;
      if (item.priceFrom !== undefined && typeof item.priceFrom !== "boolean") return false;
      if (item.equipmentPriceEur != null && (typeof item.equipmentPriceEur !== "string" || !/^\d{1,10}(?:\.\d{1,2})?$/.test(item.equipmentPriceEur))) return false;
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) return false;
      if (!["ru", "en", "kz"].every(lang => typeof item.content?.[lang]?.name === "string" && item.content[lang].name.length <= 500 && typeof item.content[lang].detail === "string" && item.content[lang].detail.length <= 1000)) return false;
      const key = cartKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch { return []; }
}
