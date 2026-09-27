// 临时审查脚本：按《内容审查与扩充方案》§7 词表扫描知识正文（P7 阶段动作）
import fs from 'node:fs';

const src = fs.readFileSync('src/data.ts', 'utf8');
const bodies = [...src.matchAll(/body: '((?:[^'\\]|\\.)*)'/g)].map(m => m[1]);
console.log('body count:', bodies.length);

// §7 必须替换的绝对化词（出现≠违规：需人工区分「引用否定」与「断言」，先全部列出）
const words = ['绝对不要', '坚决不用', '千万别', '必然', '无脑', '必用', '禁止', '最好的', '完全', '万能', '百分百', '保证', '根治', '神物', '硬核', '一定'];
const hits = {};
for (const w of words) {
  bodies.forEach((b, i) => {
    const line = b.split('\n').find(l => l.includes(w));
    if (line) (hits[w] = hits[w] || []).push(line.slice(0, 70));
  });
}
console.log(JSON.stringify(hits, null, 1));

// 伪判据句式扫描
const patterns = [/无.{0,3}=.{0,3}(危险|安全)/, /如果有.{0,6}就说明/, /一招判断/, /扫不到就是安全/];
for (const p of patterns) {
  bodies.forEach((b) => {
    const line = b.split('\n').find(l => p.test(l));
    if (line) console.log('PATTERN HIT:', p.source, '→', line.slice(0, 60));
  });
}

// 检查遗漏的内容锚点
const anchors = ['行李不要放在床上', '就地翻滚', '抓获犯罪嫌疑人 124', '防控暴恐'];
for (const a of anchors) console.log(a, '→', bodies.some(b => b.includes(a)) ? '已收录' : '未收录');
