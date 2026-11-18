export type AccessoryVariant = {
  id: string;
  sku: string;
  volumeMl?: string | null;
  color: string;
  price: string;
  currency: string;
  active: boolean;
  availability?: "in_stock" | "out_of_stock";
};
export const availabilityLabels = { in_stock: "В наличии", out_of_stock: "Нет в наличии" };

export type StaffAccessory = {
  volumes?: import('../../accessories/model').AccessoryVolume[];
  id: string;
  slug?: string;
  name: string;
  brand: string;
  category: string;
  state: "draft" | "review" | "published" | "archived";
  description: string;
  searchText?: string;
  updatedAt?: string;
  image?: string | null;
  variants: AccessoryVariant[];
};

export const accessoryStates = {
  draft: "Черновик", review: "На проверке", published: "Опубликовано", archived: "Архив",
};

export function staffAccessorySkus(product: Pick<StaffAccessory, "variants" | "volumes">): string[] {
  const skus = product.volumes?.length
    ? product.volumes.flatMap(volume => product.variants.map(variant => volume.skuByVariant ? volume.skuByVariant[variant.id] ?? "" : variant.sku))
    : product.variants.map(variant => variant.sku);
  return [...new Set(skus.map(sku => sku.trim()).filter(sku => sku && !/^ACC-[0-9a-f-]{36}$/i.test(sku)))];
}

export const accessoryCategories: Record<string, string> = {
  "coffee-makers": "Кофеварки", grinders: "Кофемолки", baskets: "Корзины и портафильтры",
  storage: "Хранение кофе", "milk-tools": "Для молока и латте-арта",
  "tamping-stations": "Коврики и рабочее место", tampers: "Темперы", distributors: "Разравниватели",
  drinkware: "Чашки и термосы", kettles: "Чайники", filters: "Фильтры", drippers: "Воронки",
  sets: "Наборы", cleaning: "Уход и очистка", rinsers: "Ринзеры", dosing: "Дозирование",
  serving: "Сервировка", cupping: "Дегустация", gifts: "Брелки и подарки", scales: "Весы",
};

export function filterAccessories(products: StaffAccessory[], query: string, category: string, state: string) {
  const terms = query.trim().toLocaleLowerCase("ru").split(/\s+/).filter(Boolean);
  return products.filter((product) => {
    if (category && product.category !== category) return false;
    if (state && product.state !== state) return false;
    const haystack = [product.name, product.brand, product.description, product.searchText,
      accessoryCategories[product.category] ?? product.category,
      ...product.variants.flatMap((variant) => [variant.sku, variant.color, variant.volumeMl]),
      ...(product.volumes ?? []).flatMap(volume => [volume.value, volume.unit, ...Object.values(volume.skuByVariant ?? {})]),
    ].join(" ").toLocaleLowerCase("ru");
    return terms.every((term) => haystack.includes(term));
  });
}
