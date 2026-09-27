// engine.js — 规则求值 + 行程存储。纯逻辑，不碰 DOM；node 测试通过 eval 加载本文件与 data.js。

// localStorage 在 node 里不存在 → 内存兜底（也让测试可以注入干净状态）
const Storage = (typeof localStorage === 'undefined'
  ? { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } }
  : localStorage);
const STORE_KEY = 'htb_stays_v1';

// conditions: {nights, adults, children, childAge, elderly, pet, purpose, prefs:{sleep,hygiene,mosquito,gadgets}, gender?, relation?}
function buildPrep(conditions) {
  return ITEMS
    .filter(it => it.when(conditions))
    .map(it => ({
      itemId: it.id,
      name: it.name,
      cat: it.cat,
      unit: it.unit,
      prep: it.prep,
      source: it.prep === '必带' ? '必备' : '推荐',
      users: it.users === 'child' ? '儿童' : (it.users === 'shared' ? '共用' : '每人'),
      qty: defaultQty(it, conditions),
      done: false,
    }));
}

const CAT_ORDER = ['证件', '洗漱', '卫生', '睡眠', '驱蚊', '电子', '安全', '适老', '儿童', '健康', '长住', '自定义'];
function sortItems(items) {
  return [...items].sort((a, b) =>
    CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat) || a.name.localeCompare(b.name, 'zh'));
}

// —— 行程存取 ——
function listStays() {
  return JSON.parse(Storage.getItem(STORE_KEY) || '[]');
}
function saveStay(stay) {
  const all = listStays();
  const i = all.findIndex(s => s.id === stay.id);
  if (i >= 0) all[i] = stay; else all.push(stay);
  Storage.setItem(STORE_KEY, JSON.stringify(all));
  return stay;
}
function getStay(id) {
  return listStays().find(s => s.id === id) || null;
}
function deleteStay(id) {
  Storage.setItem(STORE_KEY, JSON.stringify(listStays().filter(s => s.id !== id)));
}
function newStay(conditions, prepItems) {
  return {
    id: 'stay_' + Date.now().toString(36),
    createdAt: new Date().toISOString(),
    date: conditions.date || '',
    nights: conditions.nights,
    conditions,
    prep: prepItems,        // [{itemId?, name, cat, unit, prep, source, users, qty, done}]
    custom: [],             // 用户自定义物品 {name, cat:'自定义', qty, unit, prep, users, done}
    checkin: CHECKLISTS.checkin.groups.map(g => g.items.map(() => false)), // 打勾状态按组
    checkout: CHECKLISTS.checkout.groups.map(g => g.items.map(() => false)),
  };
}

if (typeof module !== 'undefined') module.exports = { buildPrep, sortItems, listStays, saveStay, getStay, deleteStay, newStay, Storage, STORE_KEY, defaultQty };
