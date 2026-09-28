import fs from 'node:fs';

// README.md 用法与限制同步
let t = fs.readFileSync('README.md', 'utf8');
const oldUsage = `1. 首页点「创建一次入住」，回答 5 个小问题（日期与晚数、人数、同行人员、场景、偏好）
2. 系统按规则生成这次入住的准备清单，共 36 条物品规则参与计算，数量自动按人数与晚数折算，并区分「必带 / 建议购买 / 家里带」
3. 勾选备齐情况，可修改数量、删除或添加自定义物品（如相机、常用药品）
4. 到酒店后进入「入住检查」（15 项，含消防观察与应急物资确认），离开前过「退房检查」（14 项）
5. 「知识库」收录 43 条带证据等级与来源的条目，覆盖行前、消防、隐私、卫生、维权、特殊场景等方向，顶部带免责声明，紧急联络模块提供可一键复制的话术`;
const newUsage = `1. 首页点「创建一次入住」，回答 5 个小问题（日期与晚数、人数、同行人员、场景、偏好）。人数可精确设置（1–10 人，不再压缩为「3 人及以上」）
2. 系统按规则生成这次入住的准备清单，共 56 条物品规则参与计算，数量自动按人数与晚数折算，并区分「必带 / 建议购买 / 家里带」；确认清单顶部有「这些选择如何影响清单」摘要卡
3. 勾选备齐情况，可修改数量（可减至 0 = 不带）、删除、从下拉添加衣物类型或自定义物品（如相机、常用药品）
4. 到酒店后进入「入住检查」（15 项，含消防观察与应急物资确认），离开前过「退房检查」（14 项）
5. 「知识库」收录 44 条带证据等级与来源的条目，覆盖使用说明、紧急联络、消防、隐私、卫生、维权、行前、特殊场景等方向，顶部带免责声明，紧急话术可一键复制
6. 底部「好物」页聚合所有物品的品牌收藏（可增删）；行程页右上角有紧急快捷入口；首页底部可导出/导入 JSON 备份`;
if (!t.includes(oldUsage)) throw new Error('README usage block not found');
t = t.replace(oldUsage, newUsage);

const oldLimit = `- 行程数据存浏览器 localStorage，清除浏览器数据即丢失；可在首页「备份与恢复」导出 JSON 备份、导入恢复
- 知识库目前为 10 条种子条目；全量 40 条的核查素材已在仓库内，待回填`;
const newLimit = `- 行程数据存浏览器 localStorage，清除浏览器数据即丢失；可在首页「备份与恢复」导出 JSON 备份、导入恢复
- 所有数量均为建议值（人数 ×（晚数 + 1）等公式），可逐项手动调整；湿巾等无法按人数推导的物品请自行修改
- V1.2 规划（来自外部评审）：完整采购状态闭环（待购买/已购买/家里已有）、多儿童独立年龄段、PC 宽屏双栏布局`;
if (!t.includes(oldLimit)) throw new Error('known-limits block not found');
t = t.replace(oldLimit, newLimit);
fs.writeFileSync('README.md', t);

// README_EN.md 镜像同步
let e = fs.readFileSync('README_EN.md', 'utf8');
const oldUsageEn = `1. Click "创建一次入住" (create a stay) on the home page and answer 5 short questions (dates and nights, guests, companions, purpose, preferences)
2. The app generates a packing list from 49 item rules; quantities are derived from guests and nights, and each item is tagged as "must bring / buy / bring from home"
3. Check items off, adjust quantities, or add custom items (camera, medication, etc.)
4. At the hotel, run the 15-item check-in check (fire observations and emergency supplies included); before leaving, run the 14-item checkout check
5. The knowledge section holds 44 entries with evidence levels and sources, covering pre-trip, fire safety, privacy, hygiene, consumer rights and special scenarios, with a disclaimer up top and one-tap copy for emergency phrasing`;
const newUsageEn = `1. Click "创建一次入住" (create a stay) on the home page and answer 5 short questions (dates and nights, guests, companions, purpose, preferences). Guest count is exact (1–10, no more "3+ guests" compression)
2. The app generates a packing list from 56 item rules; quantities are derived from guests and nights, and each item is tagged as "must bring / buy / bring from home". A summary card shows how each choice affects the list
3. Check items off, adjust quantities (down to 0 = not bringing), add clothing types from a dropdown, or add custom items (camera, medication, etc.)
4. At the hotel, run the 15-item check-in check (fire observations and emergency supplies included); before leaving, run the 14-item checkout check
5. The knowledge section holds 44 entries with evidence levels and sources across usage guide, emergency phrasing, fire safety, privacy, hygiene, consumer rights, pre-trip and special scenarios, with a disclaimer up top`;
if (!e.includes(oldUsageEn)) throw new Error('EN usage block not found');
e = e.replace(oldUsageEn, newUsageEn);
const oldLimitEn = `- Stay data lives in browser localStorage: clearing browser data deletes it. Use the backup/export card on the home page to save a JSON backup and import it back`;
const newLimitEn = `- Stay data lives in browser localStorage: clearing browser data deletes it. Use the backup/export card on the home page to save a JSON backup and import it back
- Quantities are suggestions (guests × (nights + 1) etc.), adjustable per item; items like wipes cannot be derived from headcount, adjust manually
- V1.2 roadmap (from external review): full purchase-status loop (to buy / bought / already at home), independent age per child, desktop two-column layout`;
if (!e.includes(oldLimitEn)) throw new Error('EN known-limits block not found');
e = e.replace(oldLimitEn, newLimitEn);
fs.writeFileSync('README_EN.md', e);

// facts
let f = fs.readFileSync('facts.md', 'utf8');
f = f.replace(/49 条物品规则/g, '56 条物品规则').replace(/\| 49 条物品规则[^\n]*/, '| 56 条物品规则 | `grep -c "prep: \'" src/data.ts` | 56 |');
fs.writeFileSync('facts.md', f);
console.log('usage/limits synced:', t.includes('56 条物品规则'), t.includes('44 条'), t.includes('V1.2 规划'));
