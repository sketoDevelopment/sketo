"use client";

import { useRef, useState } from "react";
import { isOrderCity, type OrderCity } from "./cities";

const STORAGE_KEY = "sketo-order-city-v1";

export default function useOrderCity() {
  const [city, setCity] = useState<OrderCity>("astana");
  const initialized = useRef(false);

  const select = (next: OrderCity) => {
    setCity(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* Keep selection in memory. */ }
  };

  const initialize = () => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isOrderCity(stored)) setCity(stored);
    } catch { /* Manual selection still works. */ }
  };

  return { city, select, initialize };
}
