import fs from 'node:fs';

// ===== WizardView：3人及以上 → 展开数字步进器，内部存真实人数 =====
let w = fs.readFileSync('src/components/WizardView.vue', 'utf8');
const oldStep2 = `    <div class="glass card">
      <div class="chips">
        <button v-for="n in [1, 2, 3]" :key="n" class="chip" :class="{ on: draft.adults === n }" @click="draft.adults = n">
          <Users :size="16" />{{ n === 3 ? '3 人及以上' : \`\${n} 人\` }}
        </button>
      </div>
    </div>`;
const newStep2 = `    <div class="glass card">
      <div class="chips">
        <button v-for="n in [1, 2, 3]" :key="n" class="chip" :class="{ on: draft.adults === n || (n === 3 && draft.adults > 3) }" @click="draft.adults = Math.max(draft.adults, n)">
          <Users :size="16" />{{ n === 3 ? '3 人及以上' : \`\${n} 人\` }}
        </button>
      </div>
      <template v-if="draft.adults >= 3">
        <p class="fxline">几人入住就按几人准备，请确认真实人数</p>
        <div class="nights">
          <Stepper v-model="draft.adults" :min="3" :max="10" unit="人" />
        </div>
      </template>
    </div>`;
if (!w.includes(oldStep2)) throw new Error('step2 block not found');
w = w.replace(oldStep2, newStep2);
fs.writeFileSync('src/components/WizardView.vue', w);
console.log('step2 real-count done');

// ===== types.ts：Guest 轻量模型 =====
let ty = fs.readFileSync('src/types.ts', 'utf8');
ty = ty.replace(
  'export type RiskLevel',
  `export interface Guest {
  id: string;
  kind: 'adult' | 'child' | 'elderly';
  label: string;
  childAge?: ChildAge;
}

export type RiskLevel`,
);
ty = ty.replace(
  `export interface Stay {
  id: string;`,
  `export interface Stay {
  id: string;
  guests: Guest[];`,
);
fs.writeFileSync('src/types.ts', ty);
console.log('types Guest added');

// ===== engine.ts：生成 guests + 读时迁移 =====
let e = fs.readFileSync('src/engine.ts', 'utf8');
e = e.replace(
  'import type { Conditions, PrepItem, Stay } from './types';'.replace(/'/g, "'"),
  "import type { Conditions, Guest, PrepItem, Stay } from './types';",
);
e = e.replace(
  'export function newStay(',
  `/** 按 conditions 生成默认入住人（成人 N + 儿童 N + 老人） */
export function buildGuests(c: Conditions): Guest[] {
  const out: Guest[] = [];
  for (let i = 1; i <= c.adults; i++) out.push({ id: \`guest_a\\\${i}\`, kind: 'adult', label: \\\`入住人\\\${i}\\\` });
  for (let i = 1; i <= c.children; i++) out.push({ id: \\\`guest_c\\\${i}\\\`, kind: 'child', label: c.children === 1 ? '儿童' : \\\`儿童\\\${i}\\\`, childAge: c.childAge });
  if (c.elderly) out.push({ id: 'guest_e1', kind: 'elderly', label: '老人' });
  return out;
}

/** 旧数据迁移：无 guests 的行程按 conditions 补齐（assign 旧文案与新 label 兼容） */
export function ensureGuests(s: Stay): Stay {
  if (!Array.isArray(s.guests)) s.guests = buildGuests(s.conditions);
  return s;
}

export function newStay(`,
);
e = e.replace(
  '    conditions: clone(conditions),',
  '    guests: buildGuests(conditions),\n    conditions: clone(conditions),',
);
e = e.replace(
  'export function listStays(): Stay[] {\n  return JSON.parse(Storage.getItem(STORE_KEY) || \'[]\') as Stay[];\n}',
  'export function listStays(): Stay[] {\n  return (JSON.parse(Storage.getItem(STORE_KEY) || \'[]\') as Stay[]).map(ensureGuests);\n}',
);
fs.writeFileSync('src/engine.ts', e);
console.log('engine guests done');
