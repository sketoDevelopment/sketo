"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import usePersistentLanguage from "../components/usePersistentLanguage";
import { cartKey, cartTotals, MAX_QUANTITY, type CartLine } from "./model";
import { useCartLines, changeQuantity, removeFromCart } from "./store";
import { cartCopy } from "./copy";
import type { Language } from "../components/language";
import styles from "./cart.module.css";
import { formatEquipmentPrice } from "@/lib/equipment-price";
import { buildWhatsAppCartUrl } from "./whatsapp";
import useOrderCity from "./useOrderCity";
import { orderCities } from "./cities";

const CartContext = createContext<(() => void) | null>(null);
export function useOpenCart() {
  const open = useContext(CartContext);
  if (!open) throw new Error("CartProvider is missing");
  return open;
}
export function money(amount: number, language: Language) {
  return new Intl.NumberFormat(language === "kz" ? "kk-KZ" : language === "ru" ? "ru-RU" : "en-GB", { maximumFractionDigits: 2 }).format(amount / 100) + " ₸";
}
export function CartItems({ lines, language, onNavigate }: { lines: CartLine[]; language: Language; onNavigate?: () => void }) {
  const t = cartCopy[language];
  return <ul className={styles.items}>{lines.map(line => {
    const key = cartKey(line);
    const text = line.content[language];
    return <li key={key} className={styles.item}>
      <Link href={line.href} onClick={onNavigate} className={styles.imageLink} tabIndex={-1} aria-hidden="true"><Image src={line.image || "/image-unavailable.svg"} alt="" width={108} height={120} unoptimized /></Link>
      <div className={styles.itemBody}>
        <div className={styles.itemHeading}><Link href={line.href} onClick={onNavigate}>{text.name}</Link><button type="button" className={styles.iconButton} onClick={() => removeFromCart(key)} aria-label={`${t.remove}: ${text.name}`}><span aria-hidden="true">×</span></button></div>
        {text.detail && <p className={styles.detail}>{text.detail}</p>}
        <div className={styles.itemBottom}>
          <div className={styles.quantity} role="group" aria-label={text.name}>
            <button type="button" disabled={line.quantity <= 1} aria-label={`${t.minus}: ${text.name}`} onClick={() => changeQuantity(key, line.quantity - 1)}>−</button>
            <span aria-live="polite" aria-atomic="true">{line.quantity}</span>
            <button type="button" disabled={line.quantity >= MAX_QUANTITY} aria-label={`${t.plus}: ${text.name}`} onClick={() => changeQuantity(key, line.quantity + 1)}>+</button>
          </div>
          <strong className={styles.price}>{line.unitPrice === null ? t.quote : formatEquipmentPrice(line.unitPrice * line.quantity, Boolean(line.priceFrom), language)}</strong>
        </div>
      </div>
    </li>;
  })}</ul>;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [language] = usePersistentLanguage();
  const t = cartCopy[language];
  const pathname = usePathname();
  const orderCity = useOrderCity();
  const [choosingCity, setChoosingCity] = useState(false);
  const [cityConfirmed, setCityConfirmed] = useState(false);
  const cityButton = useRef<HTMLButtonElement>(null);
  const chooseCityLabel = language === "en" ? "Choose a city" : language === "kz" ? "Қаланы таңдау" : "Выбрать город";
  const [openPath, setOpenPath] = useState<string | null>(null);
  const isOpen = openPath === pathname;
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const releaseDialog = useRef<(() => void) | null>(null);
  const lines = useCartLines();
  const totals = cartTotals(lines);
  const close = () => setOpenPath(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element || (!isOpen && !element.open)) return;
    const wasOpen = element.open;
    if (isOpen && !wasOpen) {
      const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const previousOverflow = document.documentElement.style.overflow;
      const smoother = ScrollSmoother.get();
      const wasPaused = smoother?.paused();
      smoother?.paused(true);
      document.documentElement.style.overflow = "hidden";
      element.showModal();
      closeButton.current?.focus();
      releaseDialog.current = () => {
        element.close();
        document.documentElement.style.overflow = previousOverflow;
        if (smoother && !wasPaused) smoother.paused(false);
        if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
        releaseDialog.current = null;
      };
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animation = element.animate(
      [{ transform: wasOpen ? getComputedStyle(element).transform : "translateX(100%)" },
        { transform: isOpen ? "translateX(0)" : "translateX(100%)" }],
      { duration: reducedMotion ? 0 : isOpen ? 480 : 360, easing: isOpen ? "cubic-bezier(.22, 1, .36, 1)" : "cubic-bezier(.4, 0, .2, 1)", fill: "forwards" },
    );
    animation.onfinish = () => {
      if (!isOpen) releaseDialog.current?.();
    };
    return () => {
      // Preserve the current position if the user reverses direction mid-animation.
      element.style.transform = getComputedStyle(element).transform;
      animation.cancel();
    };
  }, [isOpen]);

  useEffect(() => () => releaseDialog.current?.(), []);

  useEffect(() => {
    if (choosingCity) cityButton.current?.focus();
  }, [choosingCity]);

  return <CartContext.Provider value={() => { setChoosingCity(false); setCityConfirmed(false); setOpenPath(pathname); orderCity.initialize(); }}>
    {children}
    <dialog ref={dialog} className={styles.dialog} data-state={isOpen ? "open" : "closing"} aria-labelledby="cart-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className={styles.panel}>
        <header className={styles.header}><h2 id="cart-title">{t.title} <span>({totals.count})</span></h2><button ref={closeButton} type="button" className={styles.iconButton} onClick={close} aria-label={t.close}>×</button></header>
        <div className={styles.scrollArea} data-lenis-prevent>
          {lines.length ? <CartItems lines={lines} language={language} onNavigate={close} /> : <div className={styles.empty}><h3>{t.empty}</h3><p>{t.emptyNote}</p><Link href="/catalog" className={styles.textLink} onClick={close}>{t.browse} ↗</Link></div>}
        </div>
        <footer className={styles.summary}>
          {lines.length > 0 && <>
            <div className={styles.total} aria-live="polite"><span>{totals.needsQuote ? t.knownTotal : t.total}</span><strong>{formatEquipmentPrice(totals.subtotal, totals.priceFrom, language)}</strong></div>
            <p className={styles.note}>{totals.needsQuote && `${t.quoteNote} `}{t.note}</p>
            {choosingCity ? <>
              <div className={styles.cityTabs} role="group" aria-label={chooseCityLabel}>
                {(["astana", "almaty"] as const).map(city => <button ref={city === "astana" ? cityButton : undefined} key={city} type="button" aria-pressed={cityConfirmed && orderCity.city === city} onClick={() => { orderCity.select(city); setCityConfirmed(true); }}>{orderCities[city].name[language]}</button>)}
              </div>
              {cityConfirmed
                ? <a href={buildWhatsAppCartUrl(lines, language, orderCity.city)} className={styles.primary} target="_blank" rel="noopener noreferrer">{t.checkout}</a>
                : <button type="button" className={styles.primary} disabled>{t.checkout}</button>}
            </> : <button type="button" className={styles.primary} onClick={() => setChoosingCity(true)}>{chooseCityLabel}</button>}
          </>}
        </footer>
      </div>
    </dialog>
  </CartContext.Provider>;
}
