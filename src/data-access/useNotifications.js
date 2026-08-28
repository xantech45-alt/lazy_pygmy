/**
 * useNotifications — single source of truth for the in-app notification feed.
 *
 * Architecture:
 *   - The notifications array lives in `lp_notifications` (localStorageStore).
 *   - The unread badge shown in the Topbar reads from the same store, via the
 *     storage event so multiple tabs stay in sync.
 *   - A small in-memory pub/sub lets React components subscribe to changes
 *     without re-mounting on every read.
 *
 * Each notification record shape (mirrored from mockData.notifications):
 *   { id, title, text, time, type: 'Stock'|'Orders'|'System', level: 'danger'|'warning'|'info'|'success', unread: boolean }
 */
import { useCallback, useEffect, useState } from 'react';
import { localStorageStore } from './localStorageStore.js';

const listeners = new Set();

function read() {
  return localStorageStore.getNotifications();
}

function write(next) {
  localStorageStore.saveNotifications(next);
  listeners.forEach((l) => {
    try {
      l(next);
    } catch {
      /* ignore listener failures */
    }
  });
}

function subscribe(listener) {
  listeners.add(listener);
  const onStorage = (e) => {
    if (e.key === 'lp_notifications') listener(read());
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useNotifications() {
  const [items, setItems] = useState(() => read());

  useEffect(() => subscribe(setItems), []);

  const unreadCount = items.reduce((acc, n) => acc + (n.unread ? 1 : 0), 0);

  const markAllRead = useCallback(() => {
    const next = read().map((n) => ({ ...n, unread: false }));
    write(next);
  }, []);

  const markRead = useCallback((id) => {
    const next = read().map((n) => (n.id === id ? { ...n, unread: false } : n));
    write(next);
  }, []);

  const markUnread = useCallback((id) => {
    const next = read().map((n) => (n.id === id ? { ...n, unread: true } : n));
    write(next);
  }, []);

  const clearRead = useCallback(() => {
    const next = read().filter((n) => n.unread);
    write(next);
  }, []);

  const add = useCallback((n) => {
    const next = [{ ...n, unread: n.unread ?? true, id: n.id ?? `n-${Date.now()}` }, ...read()];
    write(next);
  }, []);

  return { items, unreadCount, markAllRead, markRead, markUnread, clearRead, add };
}

/**
 * Counts notifications added in the last `days` days based on the time field.
 * The seed data uses short labels like "12m", "2h", "3d" so we parse those.
 */
export function recentCount(items, days = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter((item) => {
    const t = (item.time || '').toLowerCase().trim();
    if (t === 'just now' || t === 'now') return true;
    const m = t.match(/^(\d+)\s*(m|h|d|w)$/);
    if (!m) return true; // unknown → count it
    const [, num, unit] = m;
    const n = Number(num);
    const ms = unit === 'm' ? n * 60_000 : unit === 'h' ? n * 3_600_000 : unit === 'd' ? n * 86_400_000 : n * 604_800_000;
    return Date.now() - ms <= cutoff ? false : true;
  }).length;
}
