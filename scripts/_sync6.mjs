import fs from 'node:fs';

// README.md 已知限制补全（V1.2 规划 + 数量建议值说明）
let t = fs.readFileSync('README.md', 'utf8');
const oldLimit = `- 行程数据存浏览器 localStorage，清除浏览器数据即丢失；可在首页「备份与恢复」导出 JSON 备份、导入恢复
- 季节不自动推断，由用户在问卷中勾选「蚊虫季节」；目的地天气未接入
- 数量公式是简化规则（人数 ×（晚数 + 1）），可在清单中手动调整`;
const newLimit = `- 行程数据存浏览器 localStorage，清除浏览器数据即丢失；可在首页「备份与恢复」导出 JSON 备份、导入恢复
- 季节不自动推断，由用户在问卷中勾选「蚊虫季节」；目的地天气未接入
- 数量公式是简化建议值（人数 ×（晚数 + 1）等），可在清单中逐项手动调整；湿巾等无法按人数推导的物品请自行修改
- V1.2 规划（来自外部评审意见）：完整采购状态闭环（待购买/已购买/家里已有）、多儿童独立年龄段（Guest 完整模型）、PC 宽屏双栏布局`;
if (!t.includes(oldLimit)) throw new Error('known-limits block not found');
t = t.replace(oldLimit, newLimit);
fs.writeFileSync('README.md', t);

// README_EN.md 已知限制补全
let e = fs.readFileSync('README_EN.md', 'utf8');
const oldLimitEn = `- Stay data lives in browser localStorage: clearing browser data deletes it. Use the backup/export card on the home page to save a JSON backup and import it back
- Season is not inferred automatically; users tick "mosquito season" in the questionnaire. Destination weather is not integrated
- Quantity formulas are simplified rules (guests × (nights + 1)); adjust manually in the list`;
const newLimitEn = `- Stay data lives in browser localStorage: clearing browser data deletes it. Use the backup/export card on the home page to save a JSON backup and import it back
- Season is not inferred automatically; users tick "mosquito season" in the questionnaire. Destination weather is not integrated
- Quantity formulas are suggestions (guests × (nights + 1) etc.), adjustable per item; items like wipes cannot be derived from headcount, adjust manually
- V1.2 roadmap (from external review): full purchase-status loop (to buy / bought / already at home), independent age per child (full Guest model), desktop two-column layout`;
if (!e.includes(oldLimitEn)) throw new Error('EN known-limits block not found');
e = e.replace(oldLimitEn, newLimitEn);
fs.writeFileSync('README_EN.md', e);

// facts
let f = fs.readFileSync('facts.md', 'utf8');
f = f.replace(/49 条物品规则/g, '56 条物品规则').replace(/\| 49 条物品规则[^\n]*/, '| 56 条物品规则 | `grep -c "prep: \'" src/data.ts` | 56 |');
fs.writeFileSync('facts.md', f);
console.log('limits synced');
