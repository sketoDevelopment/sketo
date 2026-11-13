import type { Language } from "@/app/components/language";

export const WHATSAPP_NUMBER = "77473835398";

export type WhatsAppOrder = {
  kind: "coffee" | "equipment" | "accessory";
  language: Language;
  name: string;
  slug: string;
  productUrl: string;
  size?: string;
  price?: string;
  color?: string;
};

export const orderCopy = {
  ru: {
    button: "Заказать в WhatsApp",
  },
  en: {
    button: "Order on WhatsApp",
  },
  kz: {
    button: "WhatsApp арқылы тапсырыс беру",
  },
} as const;

export function buildWhatsAppOrderUrl(order: WhatsAppOrder) {
  const name = order.name.trim() || order.slug;
  const text = {
    ru: {
      intro: `Здравствуйте! Хочу заказать ${order.kind === "coffee" ? "кофе" : order.kind === "accessory" ? "аксессуар" : "оборудование"} «${name}».`,
      size: "Вес", price: "Цена на сайте",
      question: order.kind === "coffee"
        ? "Подскажите, пожалуйста, наличие и как оформить заказ."
        : "Подскажите, пожалуйста, стоимость, наличие и условия поставки.",
    },
    en: {
      intro: `Hello! I'd like to order ${order.kind === "coffee" ? "coffee" : order.kind === "accessory" ? "an accessory" : "equipment"}: ${name}.`,
      size: "Weight", price: "Website price",
      question: order.kind === "coffee"
        ? "Could you confirm availability and help me place an order?"
        : "Could you share the price, availability and delivery terms?",
    },
    kz: {
      intro: `Сәлеметсіз бе! «${name}» ${order.kind === "coffee" ? "кофесіне" : order.kind === "accessory" ? "аксессуарына" : "жабдығына"} тапсырыс бергім келеді.`,
      size: "Салмағы", price: "Сайттағы баға",
      question: order.kind === "coffee"
        ? "Қолда бар-жоғын және тапсырысты қалай рәсімдеуге болатынын айта аласыз ба?"
        : "Бағасын, қолда бар-жоғын және жеткізу шарттарын айта аласыз ба?",
    },
  }[order.language];
  const message = [
    text.intro,
    "",
    ...(order.kind === "accessory" && order.slug.trim() ? [`${order.language === "en" ? "SKU" : "Артикул"}: ${order.slug.trim()}`] : []),
    ...(order.kind === "coffee" && order.size?.trim() ? [`${text.size}: ${order.size.trim()}`] : []),
    ...(order.kind === "accessory" && order.color?.trim() ? [`${order.language === "en" ? "Colour" : order.language === "kz" ? "Түсі" : "Цвет"}: ${order.color.trim()}`] : []),
    ...(order.price?.trim() ? [`${text.price}: ${order.price.trim()}`] : []),
    order.productUrl,
    "",
    text.question,
  ].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
