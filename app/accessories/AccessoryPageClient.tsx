"use client";
import Link from "next/link";
import { useState } from "react";
import Footer from "../components/Footer";
import ShopHeaderActions from "../components/ShopHeaderActions";
import usePersistentLanguage from "../components/usePersistentLanguage";
import type { Language } from "../components/language";
import ProductOrderButton from "../components/ProductOrderButton";
import { localizeProduct, toMinorUnits } from "../cart/model";
import EquipmentMediaGallery from "../catalog/equipment/[slug]/EquipmentMediaGallery";
import AccessoryWorkflow from "./AccessoryWorkflow";
import type { Recommendations } from "./recommendations";
import { accessoryContent, accessorySku, accessoryVolumes, attributeRows, categoryLabel, label, priceLabel, variantImages, volumeLabel, type Accessory } from "./model";
import styles from "../catalog/equipment/[slug]/equipment-item.module.css";
import local from "./accessories.module.css";

export default function AccessoryPageClient({ item, recommendations, initialLanguage, productUrl }: {
  item: Accessory; recommendations: Recommendations; initialLanguage: Language; productUrl: string;
}) {
  const [language, setLanguage] = usePersistentLanguage(initialLanguage);
  const [selectedId, setSelectedId] = useState(item.variants[0].id);
  const variant = item.variants.find(v => v.id === selectedId) || item.variants[0];
  const volumes = accessoryVolumes(item, variant.id);
  const [selectedVolumeId, setSelectedVolumeId] = useState(volumes[0]?.id);
  const selectedVolume = volumes.find(v => v.id === selectedVolumeId) ?? volumes[0];
  const sku = accessorySku(variant, selectedVolume);
  const colors = item.variants;
  const images = variantImages(item, variant.id, selectedVolume?.id);
  const content = accessoryContent(item, language);
  const helpMessage = `${label(language,
    'Здравствуйте! Помогите, пожалуйста, с выбором аксессуара:',
    'Hello! Could you help me choose an accessory?',
    'Сәлеметсіз бе! Аксессуар таңдауға көмектесе аласыз ба?')}\n${content.name}\n${productUrl}`;
  const attributes = attributeRows(item, language);
  const pricedOption = selectedVolume ?? variant;
  const price = priceLabel(pricedOption.price, pricedOption.currency, language);
  const availability = variant.availability === "in_stock"
    ? label(language, "В наличии", "In stock", "Қолда бар") : variant.availability === "out_of_stock"
      ? label(language, "Нет в наличии", "Out of stock", "Қолда жоқ") : variant.availability === "on_order"
        ? label(language, "Под заказ", "On order", "Тапсырыс бойынша") : label(language, "Уточнить наличие", "Check availability", "Қолда барын нақтылау");
  const details = [
    { label: label(language, "Бренд", "Brand", "Бренд"), value: item.brand },
    { label: label(language, "Категория", "Category", "Санат"), value: categoryLabel(item.category, language) },
    ...attributes,
  ];
  return <main className={styles.page}><div className={styles.contentShell}>
    <div className={styles.topBar}><Link href="/" className={styles.homeLogo} aria-label="Sketo">sketo.</Link><ShopHeaderActions value={language} onChange={setLanguage} /></div>
    <section className={styles.layout}>
      <Link href="/accessories" prefetch={true} className={styles.backLink}>{label(language, "Назад к аксессуарам", "Back to accessories", "Аксессуарларға оралу")}</Link>
      <div className={`${styles.techMeta} ${local.techMeta}`}><p className={styles.techMetaText}>{item.brand}</p><p className={styles.techMetaText}>{label(language, "Галерея", "Gallery", "Галерея")} / {String(images.length).padStart(2, "0")}</p></div>
      <EquipmentMediaGallery key={`${variant.id}:${selectedVolume?.id ?? ''}`} images={images.length ? images.map(i => i.url) : ["/image-unavailable.svg"]} name={`${content.name} — ${variant.color}`} language={language} unoptimized />
      <div className={styles.infoPanel}>
        <div className={styles.headline}><h1 className={styles.title}>{content.name}</h1></div>
        {sku && <p className={local.productSku} aria-live="polite">{label(language, "Артикул", "SKU", "Артикул")}: {sku}</p>}
        {content.description && <div className={styles.infoCard}><p className={styles.sectionLabel}>{label(language, "Обзор", "Overview", "Шолу")}</p><p className={styles.description}>{content.description}</p></div>}
        {volumes.length > 0 && <div className={styles.infoCard}><p className={styles.sectionLabel}>{label(language, 'Объём', 'Volume', 'Көлем')}</p>
          <div className={local.colorOptions}>{volumes.map(volume => <button key={volume.id} type="button" className={`${local.colorOption} ${volume.id === selectedVolume?.id ? local.colorActive : ''}`} aria-pressed={volume.id === selectedVolume?.id} onClick={() => setSelectedVolumeId(volume.id)}>{volumeLabel(volume, language)}</button>)}</div>
        </div>}
        {colors.length > 1 && <div className={styles.infoCard}>
          <p className={styles.sectionLabel}>{label(language, "Цвет / исполнение", "Colour / finish", "Түс / нұсқа")}</p>
          <div className={local.colorPalette} aria-label={label(language, "Выберите цвет", "Choose a colour", "Түсті таңдаңыз")}>{colors.map(v => <button key={v.id} type="button" title={v.color} aria-label={v.color} className={`${local.colorSwatchOption} ${v.id === variant.id ? local.colorSwatchActive : ""}`} aria-pressed={v.id === variant.id} onClick={() => setSelectedId(v.id)}>
            <span className={local.swatch} style={{ background: v.hex || "transparent" }} aria-hidden="true" />
          </button>)}</div>
        </div>}
        <div className={styles.infoCard}><div className={styles.detailsList}>{details.map(detail => <div key={detail.label} className={styles.detailRow}><p className={styles.detailLabel}>{detail.label}</p><p className={styles.detailValue}>{detail.value}</p></div>)}</div></div>
        <div className={local.purchase}>
          <p className={styles.sectionLabel}>{selectedVolume
            ? label(language, "Цена / Объём / Наличие", "Price / Volume / Status", "Баға / Көлем / Мәртебе")
            : label(language, "Цена / Наличие", "Price / Status", "Баға / Мәртебе")}</p>
          <div className={local.priceLine} aria-live="polite">
            <p className={local.productPrice}>{price}</p>
            {selectedVolume && <p className={local.priceMeta}>{volumeLabel(selectedVolume, language)}</p>}
            <p className={local.priceMeta}>{availability}</p>
          </div>
          <ProductOrderButton kind="accessory" language={language} name={content.name} slug={sku} color={`${variant.color}${selectedVolume ? ` · ${volumeLabel(selectedVolume, language)}` : ''}`} price={pricedOption.price === null ? undefined : price} productUrl={productUrl}
            unavailable={variant.availability === "out_of_stock"}
            cartItem={{ kind: "accessory", slug: item.slug, sku, variantId: variant.id, volumeId: selectedVolume?.id,
              href: `/accessories/${item.slug}`, image: images[0]?.url || "/image-unavailable.svg",
              unitPrice: pricedOption.currency === "KZT" ? toMinorUnits(pricedOption.price) : null,
              content: localizeProduct(locale => ({ name: accessoryContent(item, locale).name,
                detail: [colors.length > 1 ? variant.color : "", selectedVolume ? volumeLabel(selectedVolume, locale) : ""].filter(Boolean).join(" · ") })),
            }} />
        </div>
      </div>
    </section>
    <AccessoryWorkflow recommendations={recommendations} language={language} />
    <section className={local.help} aria-labelledby="accessory-help-title">
      <div className={local.helpCopy}>
        <p className={local.helpEyebrow}>ASK SKETO</p>
        <h2 id="accessory-help-title" className={local.helpTitle}>
          <span>{label(language, 'Нужна помощь', 'Need help', 'Таңдауға')}</span>
          <span>{label(language, 'с выбором?', 'choosing?', 'көмек керек пе?')}</span>
        </h2>
      </div>
      <div className={local.helpContent}>
        <p>{label(language,
          'Расскажите, как вы готовите кофе. Поможем подобрать подходящий аксессуар, проверить совместимость и выбрать нужный размер или объём.',
          'Tell us how you make your coffee. We’ll help you choose the right accessory, check compatibility, and find the right size or volume.',
          'Кофені қалай дайындайтыныңызды айтыңыз. Сәйкес аксессуарды таңдауға, үйлесімділігін тексеруге және қажетті өлшемді немесе көлемді табуға көмектесеміз.')}</p>
        <a className={local.helpLink} href={`https://wa.me/77473835398?text=${encodeURIComponent(helpMessage)}`} target="_blank" rel="noopener noreferrer">
          <span>{label(language, 'Написать в WhatsApp', 'Chat on WhatsApp', 'WhatsApp-та жазу')}</span>
        </a>
      </div>
    </section>
  </div><Footer language={language} /></main>;
}
