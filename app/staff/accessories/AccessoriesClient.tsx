"use client";
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { accessoryStates, filterAccessories, staffAccessorySkus, type StaffAccessory } from './types';
import { changeAccessoryStates, permanentlyDeleteAccessories } from './bulk-actions';
import { useStaffFeedback } from '../StaffFeedback';
import staff from '../staff.module.css';

function availability(p: StaffAccessory) {
  return p.variants.some(v => v.active && v.availability === 'in_stock') ? 'in_stock' : 'out_of_stock';
}
export default function AccessoriesClient({ products, query, state, listView, status, sort, onRefresh }: {
  products: StaffAccessory[]; query: string; state: string; listView: 'active' | 'archive';
  status: string; sort: 'name' | 'status'; onRefresh: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<'archive' | 'permanent' | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!confirmAction) return;
    const previous = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => previous?.focus();
  }, [confirmAction]);
  const { notify, runTask } = useStaffFeedback();
  const visible = useMemo(() => filterAccessories(products, query, '', '').filter(p =>
    (status === 'all' || availability(p) === status) &&
    (listView === 'archive' ? p.state === 'archived' : p.state !== 'archived' &&
      (state === 'all' || p.state === state || (state === 'draft' && p.state === 'review'))))
    .sort((a, b) => (sort === 'status' ? Number(availability(a) === 'in_stock') - Number(availability(b) === 'in_stock') : 0) || a.name.localeCompare(b.name, 'ru', { numeric: true, sensitivity: 'base' })),
  [products, query, state, listView, status, sort]);
  const chosen = visible.filter(p => selected.includes(p.id));
  const allSelected = visible.length > 0 && chosen.length === visible.length;
  function changeState(items: StaffAccessory[]) {
    if (pending || !items.length) return;
    const restore = listView === 'archive';
    startTransition(() => runTask(restore ? 'Восстанавливаем товары…' : 'Добавляем товары в архив…', async () => {
      try {
        notify(await changeAccessoryStates(items.map(p => ({ id: p.id, version: p.updatedAt ?? '' })), restore));
        setSelected([]); setConfirmAction(null); onRefresh();
      } catch {
        notify({ status: 'error', message: 'Не удалось изменить товары. Обновите список и повторите действие.' });
      }
    }));
  }
  function deletePermanently(items: StaffAccessory[]) {
    if (pending || !items.length || listView !== 'archive') return;
    startTransition(() => runTask('Удаляем товары навсегда…', async () => {
      try {
        notify(await permanentlyDeleteAccessories(items.map(p => ({ id: p.id, version: p.updatedAt ?? '' }))));
        setSelected([]); setConfirmAction(null); onRefresh();
      } catch {
        notify({ status: 'error', message: 'Не удалось удалить товары. Обновите архив и повторите действие.' });
      }
    }));
  }
  return <section className={staff.listSection} aria-label="Каталог аксессуаров">
    {confirmAction && createPortal(<div className={staff.modalOverlay} role="presentation">
      <div className={staff.confirmModal} role="dialog" aria-modal="true" aria-labelledby="accessory-delete-title" onKeyDown={event => {
        if (event.key === 'Escape' && !pending) setConfirmAction(null);
        if (event.key === 'Tab') {
          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
          const first = buttons[0], last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
        <div className={staff.confirmModalBody}>
          <h2 id="accessory-delete-title" className={staff.confirmModalTitle}>{confirmAction === 'permanent' ? 'Удалить навсегда?' : 'Подтверждение удаления'}</h2>
          <p className={staff.confirmModalText}>{confirmAction === 'permanent'
            ? <>Выбранные товары ({chosen.length}) и их фотографии будут удалены без возможности восстановления.<br /></>
            : <>Переместить выбранные товары ({chosen.length}) в архив / корзину? Товары можно будет восстановить.<br /></>}{chosen.map(p => p.name).join(', ')}</p>
        </div>
        <div className={staff.confirmModalActions}>
          <button ref={cancelRef} type="button" className={staff.secondaryButton} disabled={pending} onClick={() => setConfirmAction(null)}>Отмена</button>
          <button type="button" className={staff.secondaryButtonDanger} disabled={pending} onClick={() => confirmAction === 'permanent' ? deletePermanently(chosen) : changeState(chosen)}>{pending ? 'Удаляем…' : confirmAction === 'permanent' ? 'Удалить навсегда' : 'Удалить'}</button>
        </div>
      </div>
    </div>, document.body)}
    <div className={staff.listToolbar}>
      <button type="button" className={staff.selectAllButton} disabled={pending} onClick={() => setSelected(allSelected ? [] : visible.map(p => p.id))}>{allSelected ? 'Снять видимые' : 'Выбрать видимые'}</button>
      <p className={staff.resultsCount} role="status">Найдено товаров: {visible.length}</p>
      <div className={staff.bulkActions}>
        <span className={staff.selectedCount}>{chosen.length ? `Выбрано: ${chosen.length}` : 'Ничего не выбрано'}</span>
        <button type="button" className={staff.secondaryButton} disabled={pending || !chosen.length} onClick={() => changeState(chosen)}>{pending ? 'Выполняем…' : listView === 'archive' ? 'Восстановить' : 'Архивировать'}</button>
        <button type="button" className={staff.secondaryButtonDanger} disabled={pending || !chosen.length} onClick={() => setConfirmAction(listView === 'archive' ? 'permanent' : 'archive')}>{listView === 'archive' ? 'Удалить навсегда' : 'Удалить'}</button>
      </div>
    </div>
    {!visible.length ? <div className={staff.emptyState}><p className={staff.emptyStateText}>Ничего не найдено. Попробуйте другой запрос или фильтр.</p></div> :
      <div className={staff.listGroups}><ul className={staff.list}>
        {visible.map(p => {
          const editorial = p.state === 'review' ? 'draft' : p.state;
          const stock = availability(p);
          const date = p.updatedAt ? new Date(p.updatedAt) : null;
          const updated = date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' }).format(date) : 'Без даты';
          return <li key={p.id}><article className={`${staff.row} ${editorial === 'draft' ? staff.rowDraft : editorial === 'archived' ? staff.rowArchived : ''}`}>
            <label className={staff.checkboxWrap}>
              <input type="checkbox" className={staff.checkbox} aria-label={`Выбрать ${p.name}`} checked={selected.includes(p.id)} disabled={pending}
                onChange={() => setSelected(current => current.includes(p.id) ? current.filter(id => id !== p.id) : [...current, p.id])} />
              <span className={staff.checkboxIndicator} />
            </label>
            <div className={staff.thumb}><Image src={p.image || '/image-unavailable.svg'} alt={p.name} fill sizes="96px" unoptimized className={staff.thumbImage} /></div>
            <div className={staff.rowBody}>
              <div className={staff.tableHead}>{['Название', 'Обновлено', 'Наличие', 'Публикация'].map((text, index) => <div key={text} className={index === 0 ? staff.tableColMain : staff.tableCol}><span className={staff.rowFieldLabel}>{text}</span></div>)}</div>
              <div className={staff.tableRow}>
                <div className={staff.tableColMain}><div className={staff.rowTitleBlock}><h2 className={staff.rowTitle}>{p.name}</h2><p className={staff.rowSku}>Артикул: {staffAccessorySkus(p).join(' / ') || 'не указан'}</p></div></div>
                <div className={staff.tableCol}><span className={staff.rowFieldValue}>{updated}</span></div>
                <div className={staff.tableCol}><span className={`${staff.status} ${staff[`status_${stock}`]}`}>{stock === 'in_stock' ? 'В наличии' : 'Нет в наличии'}</span></div>
                <div className={staff.tableCol}><span className={`${staff.editorialBadge} ${staff[`editorial_${editorial}`]}`}>{editorial === 'archived' ? 'Архив / корзина' : accessoryStates[editorial]}</span></div>
              </div>
            </div>
            <div className={staff.rowActions}>
              {p.state === 'archived' && <button type="button" className={staff.primaryButton} disabled={pending} onClick={() => changeState([p])}>Восстановить</button>}
              {p.state === 'published' && p.slug ? <Link className={staff.textAction} href={`/accessories/${p.slug}`}>Открыть страницу</Link> : <span className={staff.textActionDisabled}>Не опубликовано</span>}
              <Link className={staff.secondaryButton} href={`/staff/accessories/edit/${p.id}`}>Редактировать</Link>
            </div>
          </article></li>;
        })}
      </ul></div>}
  </section>;
}
