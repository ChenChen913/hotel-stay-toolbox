// 规则引擎自检（移植自 V1 test.js，断言不变）。运行：npm test
import { describe, expect, it } from 'vitest';
import { CAT_ORDER, CHECKLISTS, ITEMS, KNOWLEDGE } from '../src/data';
import { buildPrep, getStay, listStays, newStay, saveStay } from '../src/engine';
import type { Conditions, PrepItem } from '../src/types';

const base: Conditions = {
  date: '', nights: 3, adults: 2, children: 0, childAge: '0-3', elderly: false, pet: false,
  purpose: '旅游', prefs: { sleep: false, hygiene: false, mosquito: false, gadgets: false },
};
const get = (list: PrepItem[], part: string) => list.find(i => i.name.includes(part));

describe('规则引擎 buildPrep', () => {
  it('基础清单：证件必带、数量按人数、消耗品按晚冗余', () => {
    const p = buildPrep(base);
    expect(p.some(i => i.name.includes('身份证'))).toBe(true);
    expect(get(p, '拖鞋')!.qty).toBe(2);          // 每人一份 × 2 人
    expect(get(p, '马桶垫')!.qty).toBe(8);        // 2 × (3+1)
    expect(get(p, '充电器')!.qty).toBe(2);
    expect(get(p, '眼罩')).toBeUndefined();       // 未选睡眠敏感
    expect(get(p, '阻门器')).toBeDefined();       // 安全类默认推荐
    expect(p.every(i => i.qty >= 1)).toBe(true);
  });

  it('偏好开关触发对应物品', () => {
    const sleep = buildPrep({ ...base, prefs: { ...base.prefs, sleep: true } });
    expect(get(sleep, '眼罩')!.qty).toBe(2);
    expect(get(sleep, '耳塞')).toBeDefined();
    expect(get(buildPrep({ ...base, prefs: { ...base.prefs, mosquito: true } }), '驱蚊')).toBeDefined();
    expect(get(buildPrep({ ...base, prefs: { ...base.prefs, hygiene: true } }), '床单')).toBeDefined();
    expect(get(buildPrep({ ...base, prefs: { ...base.prefs, gadgets: true } }), '魔方')).toBeDefined();
  });

  it('儿童年龄段门控', () => {
    const baby = buildPrep({ ...base, children: 1, childAge: '0-3' });
    expect(get(baby, '纸尿裤')!.qty).toBe(4);     // 1 × (3+1)
    expect(get(baby, '婴儿湿巾')!.qty).toBe(1);
    expect(get(baby, '儿童牙刷')).toBeDefined();
    const kid = buildPrep({ ...base, children: 1, childAge: '7-12' });
    expect(get(kid, '纸尿裤')).toBeUndefined();
    expect(get(kid, '床围挡')).toBeUndefined();
    expect(get(kid, '儿童牙刷')).toBeDefined();
  });

  it('老人与长住', () => {
    const old = buildPrep({ ...base, elderly: true });
    expect(get(old, '防滑拖鞋')).toBeDefined();
    expect(get(old, '常用药品')).toBeDefined();
    expect(get(buildPrep(base), '防滑拖鞋')).toBeUndefined();
    expect(get(buildPrep({ ...base, nights: 5 }), '洗衣片')).toBeDefined();
    expect(get(buildPrep({ ...base, nights: 3 }), '洗衣片')).toBeUndefined();
  });
});

describe('数据完整性', () => {
  it('ITEMS id 无重复、分类可排序', () => {
    const ids = ITEMS.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ITEMS.every(i => CAT_ORDER.includes(i.cat))).toBe(true);
  });
  it('检查清单项数（规则表 §4）', () => {
    expect(CHECKLISTS.checkin.groups.reduce((n, g) => n + g.items.length, 0)).toBe(13);
    expect(CHECKLISTS.checkout.groups.reduce((n, g) => n + g.items.length, 0)).toBe(13);
  });
  it('知识条目 10 条且都带来源/等级', () => {
    expect(KNOWLEDGE.length).toBe(10);
    expect(KNOWLEDGE.every(k => k.source && k.updated && k.evidence && k.risk)).toBe(true);
  });
});

describe('行程存取', () => {
  it('保存后可读回，打勾状态与分组一致', () => {
    const stay = newStay(base, buildPrep(base));
    saveStay(stay);
    expect(getStay(stay.id)!.prep.length).toBe(buildPrep(base).length);
    expect(getStay(stay.id)!.checkin.length).toBe(CHECKLISTS.checkin.groups.length);
    expect(listStays().length).toBeGreaterThan(0);
  });
  it('newStay 深拷贝入参（防响应式对象别名）', () => {
    const prep = buildPrep(base);
    const stay = newStay(base, prep);
    prep[0].done = true;
    expect(stay.prep[0].done).toBe(false);
  });
});
