// 规则求值 + 行程存储。纯逻辑，不依赖 Vue/DOM；Storage 在 node 中用内存兜底（测试环境）。
import type { Conditions, PrepItem, Stay } from './types';
import { CAT_ORDER, CHECKLISTS, ITEMS, defaultQty } from './data';

// localStorage 在 node/Vitest 里不存在 → 内存兜底
interface MiniStorage {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}
function memoryStorage(): MiniStorage {
  const m = new Map<string, string>();
  return {
    getItem: k => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: k => void m.delete(k),
  };
}
export const Storage: MiniStorage =
  typeof localStorage === 'undefined' ? memoryStorage() : localStorage;

export const STORE_KEY = 'htb_stays_v1';

// 条件 → 物品清单（含数量与准备方式）
export function buildPrep(c: Conditions): PrepItem[] {
  return ITEMS
    .filter(it => it.when(c))
    .map(it => ({
      itemId: it.id,
      name: it.name,
      cat: it.cat,
      unit: it.unit,
      prep: it.prep,
      source: (it.prep === '必带' ? '必备' : '推荐') as PrepItem['source'],
      users: it.users === 'child' ? '儿童' : it.users === 'shared' ? '共用' : '每人',
      qty: defaultQty(it, c),
      done: false,
    }));
}

export function sortItems(items: PrepItem[]): PrepItem[] {
  return [...items].sort((a, b) =>
    CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat) || a.name.localeCompare(b.name, 'zh'));
}

// —— 行程存取 ——
export function listStays(): Stay[] {
  return JSON.parse(Storage.getItem(STORE_KEY) || '[]') as Stay[];
}
export function saveStay(stay: Stay): Stay {
  const all = listStays();
  const i = all.findIndex(s => s.id === stay.id);
  if (i >= 0) all[i] = stay; else all.push(stay);
  Storage.setItem(STORE_KEY, JSON.stringify(all));
  return stay;
}
export function getStay(id: string): Stay | null {
  return listStays().find(s => s.id === id) || null;
}
export function deleteStay(id: string): void {
  Storage.setItem(STORE_KEY, JSON.stringify(listStays().filter(s => s.id !== id)));
}
export function newStay(conditions: Conditions, prepItems: PrepItem[]): Stay {
  // JSON 深拷贝：入参可能是 Vue 响应式代理，structuredClone 无法克隆 Proxy
  const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
  return {
    id: 'stay_' + Date.now().toString(36),
    createdAt: new Date().toISOString(),
    date: conditions.date || '',
    nights: conditions.nights,
    conditions: clone(conditions),
    prep: clone(prepItems),
    custom: [],
    checkin: CHECKLISTS.checkin.groups.map(g => g.items.map(() => false)),
    checkout: CHECKLISTS.checkout.groups.map(g => g.items.map(() => false)),
  };
}
