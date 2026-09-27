// test.js — 规则引擎的最小自检。运行：node test.js
// 做法：把 data.js + engine.js + 测试体拼进同一个函数作用域执行（const 声明互相可见）。
const fs = require('fs');

function tests() {
  let fails = 0;
  const ok = (c, m) => { if (c) console.log(' ok -', m); else { console.error(' FAIL -', m); fails++; } };
  const names = list => list.map(i => i.name);
  const get = (list, name) => list.find(i => i.name.includes(name));
  const base = { nights: 3, adults: 2, children: 0, childAge: '0-3', elderly: false, pet: false,
                 purpose: '旅游', prefs: { sleep: false, hygiene: false, mosquito: false, gadgets: false } };

  // 基础清单
  const p = buildPrep(base);
  ok(names(p).some(n => n.includes('身份证')), '基础清单含身份证');
  ok(get(p, '拖鞋').qty === 2, '拖鞋按人数 2');
  ok(get(p, '马桶垫').qty === 8, '马桶垫消耗品 2人×(3+1)=8');
  ok(get(p, '充电器').qty === 2, '充电器按人数 2');
  ok(!get(p, '眼罩'), '未选睡眠敏感则无眼罩');
  ok(get(p, '阻门器'), '安全类默认推荐阻门器');
  ok(p.every(i => i.qty >= 1), '所有数量 ≥ 1');

  // 偏好开关
  const sleep = buildPrep({ ...base, prefs: { ...base.prefs, sleep: true } });
  ok(get(sleep, '眼罩') && get(sleep, '眼罩').qty === 2, '睡眠敏感 → 眼罩×2');
  ok(get(sleep, '耳塞'), '睡眠敏感 → 耳塞');
  ok(get(buildPrep({ ...base, prefs: { ...base.prefs, mosquito: true } }), '驱蚊'), '蚊虫季节 → 驱蚊液');
  ok(get(buildPrep({ ...base, prefs: { ...base.prefs, hygiene: true } }), '床单'), '在意卫生 → 一次性床单');
  ok(get(buildPrep({ ...base, prefs: { ...base.prefs, gadgets: true } }), '魔方'), '电子设备多 → 魔方插座');

  // 儿童年龄段门控
  const baby = buildPrep({ ...base, children: 1, childAge: '0-3' });
  ok(get(baby, '纸尿裤').qty === 4, '0-3岁 纸尿裤 1×(3+1)=4');
  ok(get(baby, '婴儿湿巾').qty === 1, '0-3岁 婴儿湿巾');
  ok(get(baby, '儿童牙刷'), '有儿童 → 儿童牙刷');
  const kid = buildPrep({ ...base, children: 1, childAge: '7-12' });
  ok(!get(kid, '纸尿裤'), '7-12岁 无纸尿裤');
  ok(!get(kid, '床围挡'), '7-12岁 无床围挡');
  ok(get(kid, '儿童牙刷'), '7-12岁 有儿童牙刷');

  // 老人 / 长住
  const old = buildPrep({ ...base, elderly: true });
  ok(get(old, '防滑拖鞋') && get(old, '常用药品'), '有老人 → 防滑拖鞋+常用药品');
  ok(!get(buildPrep(base), '防滑拖鞋'), '无老人则无适老物品');
  ok(get(buildPrep({ ...base, nights: 5 }), '洗衣片'), '晚数≥4 → 洗衣片');
  ok(!get(buildPrep({ ...base, nights: 3 }), '洗衣片'), '晚数3 → 无洗衣片');

  // 数据完整性
  const ids = ITEMS.map(i => i.id);
  ok(new Set(ids).size === ids.length, 'ITEMS id 无重复');
  ok(ITEMS.every(i => CAT_ORDER.includes(i.cat)), '每个物品分类都在 CAT_ORDER 里（否则排序失序）');
  ok(CHECKLISTS.checkin.groups.reduce((n, g) => n + g.items.length, 0) === 13, '入住检查共 13 项');
  ok(CHECKLISTS.checkout.groups.reduce((n, g) => n + g.items.length, 0) === 13, '退房检查共 13 项');
  ok(KNOWLEDGE.length === 10 && KNOWLEDGE.every(k => k.source && k.updated && k.evidence && k.risk), '知识条目 10 条且都带来源/等级');

  // 行程存取（内存 Storage，本次运行独占，无需清理）
  const stay = newStay(base, buildPrep(base));
  saveStay(stay);
  ok(getStay(stay.id).prep.length === p.length, '行程保存后可读回');
  ok(getStay(stay.id).checkin.length === CHECKLISTS.checkin.groups.length, '入住打勾状态与清单分组数一致');

  console.log(fails ? `\n${fails} 项失败` : '\n全部通过');
  if (fails) process.exitCode = 1;
}

new Function(
  fs.readFileSync('data.js', 'utf8') + '\n' +
  fs.readFileSync('engine.js', 'utf8') + '\n' +
  'return (' + tests.toString() + ')();'
)();
