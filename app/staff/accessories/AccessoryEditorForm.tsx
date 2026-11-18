"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { saveAccessory, saveAccessoryMedia } from "./editor-actions";
import type { AccessoryEditor, EditorVariant, SaveResult } from "./editor-model";
import { accessoryCategories, accessoryStates, availabilityLabels } from "./types";
import EditorSelect from "./EditorSelect";
import AccessoryMediaEditor, { type PendingPhoto } from "./AccessoryMediaEditor";
import editor from "../edit/[kind]/[slug]/page.module.css";
import styles from "./editor.module.css";
import { attributeNames } from "../../accessories/model";
import { attributeRows, serializeAttributeRows, isTranslated, updateAttributeTranslation } from "./attribute-editor";

function normalize(product: AccessoryEditor): AccessoryEditor {
  return { ...product, translations: (["ru", "en", "kz"] as const).map((locale) => product.translations.find((t) => t.locale === locale) ?? { locale, name: "", description: "" }) };
}

export default function AccessoryEditorForm({ initial }: { initial: AccessoryEditor }) {
  const [product, setProduct] = useState(() => normalize(initial));
  const [showVolumes, setShowVolumes] = useState(() => !!initial.volumes?.length);
  const [attributes, setAttributes] = useState(() => attributeRows(initial.attributes));
  const [result, setResult] = useState<SaveResult>({ status: "idle", message: "" });
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);
  const [mediaDirty, setMediaDirty] = useState(false);
  const [savedVariantIds, setSavedVariantIds] = useState(() => initial.variants.map((v) => v.id));
  const [savedVolumeIds, setSavedVolumeIds] = useState(() => (initial.volumes ?? []).map(v => v.id));
  const [locale, setLocale] = useState<"ru" | "en" | "kz">("ru");
  const [savedState, setSavedState] = useState(initial.state);
  const [queued, setQueued] = useState<PendingPhoto[]>([]);
  const [mediaResult, setMediaResult] = useState<SaveResult>({ status: 'idle', message: '' });
  const visibleSavedState = savedState === "review" ? "draft" : savedState;
  function removeColor(v: EditorVariant) {
    if (product.variants.length <= 1) return;
    if (queued.some(photo => photo.variantId === v.id)) {
      window.alert('Сначала уберите из очереди новые фотографии этого цвета или назначьте им другой цвет.');
      return;
    }
    if (!window.confirm(`Удалить цвет «${v.color || 'Новый цвет'}»? Привязанные фото останутся в карточке, но будут скрыты с сайта. Изменения применятся после нажатия «Сохранить».`)) return;
    setDirty(true);
    setProduct({ ...product,
      variants: product.variants.filter(variant => variant.id !== v.id),
      deletedVariantIds: savedVariantIds.includes(v.id) ? [...(product.deletedVariantIds ?? []), v.id] : product.deletedVariantIds,
      images: product.images.map(photo => photo.variantId === v.id ? { ...photo, variantId: null, approved: false } : photo),
    });
  }
  function appendPhotos(data: FormData) {
    queued.forEach((photo, index) => { data.append('photos', photo.file); data.set(`photoVariant:${index}`, photo.variantId ?? ''); data.set(`photoVolume:${index}`, photo.volumeId ?? ''); });
    data.set('primaryPhoto', String(queued.findIndex(photo => photo.primary)));
  }
  function uploadPhotos() {
    if (!queued.length || pending) return;
    if ([...queued, ...product.images].some(p => p.volumeId && !savedVolumeIds.includes(p.volumeId))) {
      setMediaResult({ status: 'error', message: 'Новый объём ещё не сохранён. Нажмите «Сохранить»: объём и фото сохранятся вместе.' }); return;
    }
    if (queued.some(p => p.variantId && !savedVariantIds.includes(p.variantId))) {
      setMediaResult({ status: 'error', message: 'Сначала сохраните новый цвет кнопкой «Сохранить», либо выберите существующий цвет для фото.' }); return;
    }
    const data = new FormData();
    appendPhotos(data);
    data.set('product', JSON.stringify({ id: product.id, version: product.version, images: product.images }));
    startTransition(async () => {
      try {
        const next = await saveAccessoryMedia({ status: 'idle', message: '' }, data);
        setMediaResult(next);
        if (next.status === 'success' && next.product) {
          const saved = next.product;
          setProduct(p => ({ ...p, version: saved.version, images: saved.images }));
          queued.forEach(p => URL.revokeObjectURL(p.url)); setQueued([]);
          setMediaDirty(false);
        }
      } catch { setMediaResult({ status: 'error', message: 'Не удалось получить ответ. Обновите страницу перед повторной загрузкой, чтобы избежать дубликатов.' }); }
    });
  }
  const translation = product.translations.find((t) => t.locale === locale)!;
  useEffect(() => {
    if (!dirty && !mediaDirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const beforeLink = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (link && !window.confirm("Есть несохранённые изменения. Покинуть редактор?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", beforeLink, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", beforeLink, true); };
  }, [dirty, mediaDirty]);
  function patchVariant(id: string, patch: Partial<EditorVariant>) {
    setProduct((p) => ({ ...p, variants: p.variants.map((v) => v.id === id ? { ...v, ...patch } : v) }));
  }
  function patchTranslation(patch: { name?: string; description?: string }) {
    setProduct((p) => ({ ...p, translations: p.translations.map((t) => t.locale === locale ? { ...t, ...patch } : t) }));
  }
  return <main className={editor.page}><div className={editor.shell}>
    <div className={editor.topbar}><Link href="/staff" className={editor.backLink}>Назад к кабинету</Link><span className={editor.eyebrow}>Редактор</span></div>
    <section className={editor.layout}><div className={editor.editor}>
    <section className={editor.heroCard}>
      <div className={editor.heroCopy}><span className={editor.kindLabel}>Аксессуары · {accessoryStates[visibleSavedState]}</span><h1 className={editor.pageTitle}>{product.name}</h1><p className={editor.pageMeta}>{product.brand} · {accessoryCategories[product.category] ?? product.category}</p></div>
      <div className={editor.heroMedia}>{product.images[0] && <Image src={product.images[0].url} alt={product.name} fill unoptimized sizes="(max-width: 900px) 100vw, 24rem" className={editor.heroImage} />}</div>
    </section>
    <form className={editor.editorForm} onChange={e => { if (!(e.target as Element).closest('[data-accessory-media]')) setDirty(true); }} onClick={e => { if ((e.target as Element).closest('[role="option"]') && !(e.target as Element).closest('[data-accessory-media]')) setDirty(true); }} onSubmit={(event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (attributes.some((row) => !row.key.trim()) || new Set(attributes.map((row) => row.key.trim())).size !== attributes.length) {
        setResult({ status: "error", message: "Укажите уникальные названия характеристик." }); return;
      }
      const parsed = serializeAttributeRows(attributes);
      const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
      const nextState = submitter?.value === "publish" ? "published" : submitter?.value === "unpublish" || submitter?.value === "restore" ? "draft" : submitter?.value === "archive" ? "archived" : product.state === "review" ? "draft" : product.state;
      const data = new FormData(form);
      appendPhotos(data);
      data.set("product", JSON.stringify({ ...product, state: nextState, attributes: parsed }));
      startTransition(async () => {
        try {
          const next = await saveAccessory({ status: "idle", message: "" }, data);
          setResult(next);
          if (next.status === "success" && next.product) {
            setDirty(false);
            setMediaDirty(false);
            setSavedVariantIds(next.product.variants.map((v) => v.id));
            setSavedVolumeIds((next.product.volumes ?? []).map(v => v.id));
            setProduct(normalize(next.product));
            setSavedState(next.product.state);
            setAttributes(attributeRows(next.product.attributes));
            queued.forEach(photo => URL.revokeObjectURL(photo.url));
            setQueued([]);
            const file = form.elements.namedItem("photo");
            if (file instanceof HTMLInputElement) file.value = "";
          }
        } catch { setResult({ status: "error", message: "Не удалось получить ответ. Скопируйте несохранённый текст и обновите страницу перед повторным сохранением." }); }
      });
    }}>
      <fieldset disabled={pending} className={styles.fieldset}>
        <div className={editor.actionBar} data-editor-actions aria-busy={pending}>
          <span className={editor.actionBarMeta}>{pending ? "Сохраняем…" : dirty || mediaDirty ? "Есть изменения" : "Изменений нет"}</span>
          <div className={editor.actionBarButtons}>
            <button className={editor.primaryAction} type="submit" value="save">Сохранить</button>
            <details className={editor.moreMenu}><summary>Ещё</summary><div className={editor.moreMenuItems}>
              <button className={editor.secondaryAction} type="submit" value={visibleSavedState === "published" ? "unpublish" : "publish"}>{visibleSavedState === "published" ? "Снять с публикации" : "Опубликовать"}</button>
              {visibleSavedState === "archived" ? <button className={editor.secondaryAction} type="submit" value="restore">Вернуть в черновики</button> : <>
                <button className={editor.secondaryAction} type="submit" value="archive">В архив</button>
              </>}
            </div></details>
          </div>
        </div>
        {result.message && <p role={result.status === "error" ? "alert" : "status"} className={result.status === "error" ? editor.formMessageError : editor.formMessage}>{result.message}</p>}
        <section className={editor.sectionBlock}>
          <div className={editor.sectionTopline}><h2 className={editor.sectionLabel}>Основное</h2></div>
          <div className={styles.grid}>
            <label className={styles.field}>Адрес товара<input required maxLength={160} value={product.slug} onChange={(e) => setProduct({ ...product, slug: e.target.value })} /></label>
            <label className={styles.field}>Бренд<input required maxLength={100} value={product.brand} onChange={(e) => setProduct({ ...product, brand: e.target.value })} /></label>
            <div className={styles.field}>Категория<EditorSelect label="Категория" value={product.category} options={Object.entries({ ...accessoryCategories, ...(!accessoryCategories[product.category] ? { [product.category]: product.category } : {}) }).map(([value, label]) => ({ value, label }))} onChange={category => setProduct({ ...product, category })} /></div>
          </div>
          <p className={styles.hint}>Публикация — через «Ещё → Опубликовать». Нужны описание на русском, одобренное фото и хотя бы один активный вариант с ценой. Сохранение черновика не публикует товар.</p>
        </section>
        <section className={editor.sectionBlock}>
          <div className={editor.sectionTopline}><h2 className={editor.sectionLabel}>Язык содержимого</h2></div>
          <div className={editor.localeTabs}>{(["ru", "en", "kz"] as const).map((lang) => <button type="button" key={lang} aria-pressed={locale === lang} className={`${editor.localeTab} ${locale === lang ? editor.localeTabActive : ""}`} onClick={() => setLocale(lang)}><span className={editor.localeTabLabel}>{({ ru: "Русский", en: "English", kz: "Қазақша" })[lang]}</span><span className={editor.localeTabCode}>{lang.toUpperCase()}</span></button>)}</div>
          <p className={styles.hint}>Один язык для названия, описания и всех текстовых характеристик. Цена, наличие и цвета общие.</p>
        </section>
        <section className={editor.sectionBlock}>
          <div className={editor.sectionTopline}><h2 className={editor.sectionLabel}>Название и описание · {locale.toUpperCase()}</h2></div>
          <label className={styles.field}>Название · {locale.toUpperCase()}<input maxLength={300} value={translation.name} onChange={(e) => patchTranslation({ name: e.target.value })} /></label>
          <label className={styles.field}>Описание · {locale.toUpperCase()}<textarea rows={6} maxLength={15000} value={translation.description} onChange={(e) => patchTranslation({ description: e.target.value })} /></label>
          <p className={styles.hint}>Русское название обязательно. Переводы можно заполнить позже.</p>
        </section>
        <section className={editor.sectionBlock}>
          <div className={editor.sectionTopline}><h2 className={editor.sectionLabel}>Характеристики</h2></div>
          <p className={editor.fieldHint}>Текстовые значения — {locale.toUpperCase()}. Числа и переключатели общие для всех языков.</p>
          <div className={editor.detailList}>{attributes.map((row, index) => {
            const update = (value: unknown) => setAttributes(attributes.map(r => r.id === row.id ? { ...r, value, numeric: r.numeric || typeof value === "number" } : r));
            return <div className={editor.detailCard} key={row.id}>
              <div className={editor.detailCardHeader}><span className={editor.detailIndex}>Характеристика {index + 1}</span><button type="button" aria-label={`Удалить характеристику ${index + 1}`} className={editor.detailRemoveButton} onClick={() => { setDirty(true); setAttributes(attributes.filter(r => r.id !== row.id)); }}><span className={editor.detailRemoveIcon} aria-hidden="true" /></button></div>
              <label className={styles.field}>Параметр · {locale.toUpperCase()}<input required maxLength={100} placeholder="Например, материал корпуса" value={row.labels?.[locale] ?? attributeNames[row.key]?.[locale === 'ru' ? 0 : locale === 'en' ? 1 : 2] ?? row.key} onChange={e => setAttributes(attributes.map(r => r.id === row.id ? { ...r, key: r.key || `custom-${r.id}`, labels: { ...(r.labels ?? { ru: attributeNames[r.key]?.[0] ?? r.key, en: attributeNames[r.key]?.[1] ?? '', kz: attributeNames[r.key]?.[2] ?? '' }), [locale]: e.target.value } } : r))} /></label>
              {(row.value === "" || isTranslated(row.value) && Object.values(row.value).every(v => v === "")) && <div className={styles.field}>Формат значения<EditorSelect label={`Формат значения ${index + 1}`} value={isTranslated(row.value) ? "translations" : "text"} options={[{ value: 'translations', label: 'Текст RU / EN / KZ' }, { value: 'text', label: 'Общий текст' }, { value: 'number', label: 'Число' }, { value: 'boolean', label: 'Да / нет' }]} onChange={type => update(type === "number" ? 0 : type === "boolean" ? false : type === "translations" ? { ru: "", en: "", kz: "" } : "")} /></div>}
              {isTranslated(row.value) ? <label className={styles.field}>Значение · {locale.toUpperCase()}<input maxLength={1000} value={String(row.value[locale] ?? "")} onChange={e => update(updateAttributeTranslation(row.value, locale, e.target.value))} /></label>
                : typeof row.value === "boolean" ? <div className={styles.field}>Значение<EditorSelect label={`Значение ${index + 1}`} value={String(row.value)} options={[{ value: 'true', label: 'Да' }, { value: 'false', label: 'Нет' }]} onChange={value => update(value === 'true')} /></div>
                : row.value !== null && typeof row.value === "object" ? <p className={editor.fieldHint}>Составная характеристика сохранена без изменений.</p>
                : <label className={styles.field}>Значение · общее для всех языков<input required={row.numeric} type={row.numeric ? "number" : "text"} step="any" maxLength={1000} value={String(row.value ?? "")} onChange={e => update(row.numeric && e.target.value !== "" ? Number(e.target.value) : e.target.value)} /></label>}
              {!row.numeric && typeof row.value === "string" && <button type="button" className={editor.detailAddButton} onClick={() => { setDirty(true); update(updateAttributeTranslation(row.value, "ru", row.value as string)); }}>Добавить переводы</button>}
            </div>;
          })}</div>
          <button type="button" className={editor.detailAddButton} onClick={() => { setDirty(true); setAttributes([...attributes, { id: crypto.randomUUID(), key: "", value: { ru: "", en: "", kz: "" } }]); }}>Добавить характеристику</button>
        </section>
        <section className={editor.sectionBlock}>
          <h2 className={editor.sectionLabel}>Цвета</h2>
          {!!product.volumes?.length && <p className={styles.hint}>Цвета и фотографии настраиваются здесь. Цена задаётся отдельно в блоке «Объёмы» и не зависит от цвета.</p>}
          {product.variants.map((v) => <div className={styles.variant} key={v.id} id={`variant-${v.id}`}>
            <h3 className={styles.optionLabel}><span className={styles.swatch} style={{ backgroundColor: /^#[\da-f]{6}$/i.test(v.hex ?? '') ? v.hex! : 'transparent' }} />{v.color || "Новый цвет"}</h3><div className={styles.grid}>
              <label className={styles.field}>Название цвета<input required maxLength={100} value={v.color} onChange={(e) => patchVariant(v.id, { color: e.target.value })} /></label>
              <label className={styles.field}>Артикул цвета<input maxLength={100} className={styles.code} placeholder="Например, BK2714" value={/^ACC-[0-9a-f-]{36}$/i.test(v.sku) ? "" : v.sku} onChange={e => patchVariant(v.id, { sku: e.target.value })} /></label>
              <div className={styles.field}><span>Оттенок</span><div className={styles.colorPicker}><input type="color" aria-label={`Палитра: ${v.color || 'новый цвет'}`} value={/^#[\da-f]{6}$/i.test(v.hex ?? '') ? v.hex! : '#000000'} onChange={e => patchVariant(v.id, { hex: e.target.value })} /><input aria-label={`HEX: ${v.color || 'новый цвет'}`} placeholder="#AABBCC" pattern="#[0-9a-fA-F]{6}" maxLength={7} value={v.hex ?? ""} onChange={e => patchVariant(v.id, { hex: e.target.value })} /></div></div>
              <div className={styles.field}>Наличие<EditorSelect label={`Наличие: ${v.color || 'новый цвет'}`} value={v.availability ?? 'in_stock'} options={Object.entries(availabilityLabels).map(([value, label]) => ({ value, label }))} onChange={value => patchVariant(v.id, { availability: value as EditorVariant['availability'] })} /></div>
              {!product.volumes?.length && <><label className={styles.field}>Цена<input required type="number" min="0" max="9999999999.99" step="0.01" value={v.price} onChange={(e) => patchVariant(v.id, { price: e.target.value })} /></label>
              <label className={styles.field}>Валюта<input required maxLength={3} value={v.currency} onChange={(e) => patchVariant(v.id, { currency: e.target.value.toUpperCase() })} /></label></>}
            </div>
            <div className={styles.buttons}>
              <label><input type="checkbox" checked={v.active} onChange={(e) => patchVariant(v.id, { active: e.target.checked })} /> Вариант активен</label>
              <button type="button" className={editor.secondaryActionDanger} disabled={product.variants.length <= 1} title={product.variants.length <= 1 ? 'В карточке должен остаться хотя бы один цвет' : undefined} onClick={() => removeColor(v)}>Удалить цвет</button>
            </div>
          </div>)}
          <button type="button" className={editor.secondaryAction} disabled={product.variants.length >= 100} onClick={() => { setDirty(true); setProduct({ ...product, variants: [...product.variants, { id: crypto.randomUUID(), sku: "", code: "", color: "", hex: null, price: "0", currency: "KZT", active: true, availability: "in_stock" }] }); }}>Добавить цвет</button>
        </section>
        <section className={editor.sectionBlock}>
          <h2 className={editor.sectionLabel}>Объёмы</h2>
          {!showVolumes && !product.volumes?.length ? <button type="button" className={editor.secondaryAction} onClick={() => setShowVolumes(true)}>Добавить варианты объёма</button> : <>
            <p className={styles.hint}>Объёмы не связаны с цветами. Для каждого задайте цену и единицу измерения: мл, л, г или свою. Если удалить все объёмы, снова будут использоваться цены из блока цветов.</p>
            {(product.volumes ?? []).map((volume, index) => <div className={styles.variant} key={volume.id}>
              <h3 className={styles.optionLabel}>Объём {index + 1}</h3>
              {volume.skuByVariant && <>
                <p className={styles.hint}>Артикулы для этого объёма по цветам. Они используются в каталоге и сообщении заказа.</p>
                <div className={styles.grid}>{product.variants.filter(variant => Object.hasOwn(volume.skuByVariant!, variant.id)).map(variant => <label key={variant.id} className={styles.field}>Артикул · {variant.color || 'Без названия'}<input required maxLength={100} className={styles.code} value={volume.skuByVariant![variant.id]} onChange={e => { setDirty(true); setProduct({ ...product, volumes: product.volumes!.map(option => option.id === volume.id ? { ...option, skuByVariant: { ...option.skuByVariant, [variant.id]: e.target.value } } : option) }); }} /></label>)}</div>
              </>}
              <div className={styles.grid}>{([
                ['value', 'Объём', 'number'], ['unit', 'Единица измерения', 'text'], ['price', 'Цена', 'number'], ['currency', 'Валюта', 'text'],
              ] as const).map(([key, title, type]) => <label key={key} className={styles.field}>{title}<input required type={type} min={key === 'value' ? '0.01' : key === 'price' ? '0' : undefined} max={key === 'value' ? '9999999.99' : key === 'price' ? '9999999999.99' : undefined} step={type === 'number' ? '0.01' : undefined} maxLength={key === 'unit' ? 20 : key === 'currency' ? 3 : undefined} value={volume[key]} onChange={e => { setDirty(true); setProduct({ ...product, volumes: product.volumes!.map(v => v.id === volume.id ? { ...v, [key]: key === 'currency' ? e.target.value.toUpperCase() : e.target.value } : v) }); }} /></label>)}</div>
              <button type="button" className={editor.secondaryActionDanger} onClick={() => {
                if (queued.some(p => p.volumeId === volume.id)) { window.alert('Сначала уберите из очереди фото этого объёма или измените их привязку.'); return; }
                if (product.images.some(p => p.volumeId === volume.id) && !window.confirm('Убрать объём? Его фотографии останутся в карточке, но будут скрыты с сайта после сохранения.')) return;
                setDirty(true); setProduct({ ...product, volumes: product.volumes!.filter(v => v.id !== volume.id), images: product.images.map(p => p.volumeId === volume.id ? { ...p, volumeId: null, approved: false } : p) });
              }}>Убрать объём</button>
            </div>)}
            <button type="button" className={editor.secondaryAction} disabled={(product.volumes?.length ?? 0) >= 100} onClick={() => { setDirty(true); setProduct({ ...product, volumes: [...(product.volumes ?? []), { id: crypto.randomUUID(), value: '', unit: 'мл', price: product.variants[0]?.price ?? '0', currency: product.variants[0]?.currency ?? 'KZT' }] }); }}>Добавить объём</button>
          </>}
        </section>
        <AccessoryMediaEditor images={product.images} variants={product.variants} volumes={product.volumes} queued={queued} disabled={pending} onUpload={uploadPhotos} result={mediaResult}
          onImages={images => { setMediaDirty(true); setProduct(p => ({ ...p, images })); }}
          onQueue={files => { setMediaDirty(true); setQueued(files); }} />
      </fieldset>
      {result.message && <p role={result.status === "error" ? "alert" : "status"} className={result.status === "error" ? editor.formMessageError : editor.formMessage}>{result.message}</p>}
    </form>
    </div></section>
  </div></main>;
}
