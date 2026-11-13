import type { Language } from "../components/language";
import { formatEquipmentPrice } from "@/lib/equipment-price";
import { orderCities, type OrderCity } from "./cities";
import { cartTotals, type CartLine } from "./model";

export function buildWhatsAppCartUrl(lines: CartLine[], language: Language, city: OrderCity = "astana"): string {
  if (!lines.length) throw new Error("Cannot send an empty cart");
  const copy = {
    ru: { intro: "Здравствуйте! Хочу заказать товары из корзины Sketo:", quantity: "Количество", price: "Цена", total: "Итого", knownTotal: "Товары с указанной ценой", ending: "Подскажите, пожалуйста, наличие, доставку и окончательную стоимость." },
    en: { intro: "Hello! I'd like to order these items from Sketo:", quantity: "Quantity", price: "Price", total: "Total", knownTotal: "Items with listed prices", ending: "Please confirm availability, delivery and the final price." },
    kz: { intro: "Сәлеметсіз бе! Sketo себетіндегі тауарларға тапсырыс бергім келеді:", quantity: "Саны", price: "Баға", total: "Барлығы", knownTotal: "Бағасы көрсетілген тауарлар", ending: "Тауарлардың бар-жоғын, жеткізуді және соңғы құнын нақтылап беріңізші." },
  }[language];
  const items = lines.map((line, index) => {
    const content = line.content[language];
    const amount = line.unitPrice === null ? null : line.unitPrice * line.quantity;
    return [
      `${index + 1}. ${content.name}${content.detail ? ` — ${content.detail}` : ""}`,
      ...(line.kind === "accessory" && line.sku?.trim() ? [`${language === "en" ? "SKU" : "Артикул"}: ${line.sku.trim()}`] : []),
      `${copy.quantity}: ${line.quantity}`,
      `${copy.price}: ${formatEquipmentPrice(amount, Boolean(line.priceFrom), language)}`,
    ].join("\n");
  });
  const totals = cartTotals(lines);
  const label = totals.needsQuote ? copy.knownTotal : copy.total;
  const destination = orderCities[city];
  const message = [copy.intro, `${language === "en" ? "City" : language === "kz" ? "Қала" : "Город"}: ${destination.name[language]}`, "", ...items.flatMap(item => [item, ""]),
    `${label}: ${formatEquipmentPrice(totals.subtotal, totals.priceFrom, language)}`, "", copy.ending].join("\n");
  return `https://wa.me/${destination.phone}?text=${encodeURIComponent(message)}`;
}
