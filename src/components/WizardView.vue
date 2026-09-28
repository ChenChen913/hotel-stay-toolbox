<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ArrowLeft, Baby, Bug, CalendarDays, Camera, ChevronRight, Compass, Droplets, Moon, PawPrint, Pill, Plug, Plus, SlidersHorizontal, Users, Briefcase } from 'lucide-vue-next';
import { buildPrep, newStay, saveStay, sortItems } from '../engine';
import type { ChildAge, Conditions, PrepItem, Purpose } from '../types';
import { fmtDate, openStay } from '../store';
import Stepper from './Stepper.vue';
import Toggle from './Toggle.vue';
import ItemRow from './ItemRow.vue';
import ClothingAdd from './ClothingAdd.vue';
import DatePicker from './DatePicker.vue';

const HINT_ICONS: Record<string, typeof Briefcase> = { briefcase: Briefcase, camera: Camera, pill: Pill, baby: Baby, 'paw-print': PawPrint };
const HINTS: { icon: string; text: string }[] = [
  { icon: 'briefcase', text: '工作：电脑、平板、U 盘、移动硬盘' },
  { icon: 'camera', text: '摄影：相机、电池、存储卡' },
  { icon: 'pill', text: '个人：常用药品、护理用品' },
  { icon: 'baby', text: '儿童：奶粉、辅食、玩具' },
  { icon: 'paw-print', text: '宠物：粮食、牵引绳（差异大，请自行添加）' },
];

const step = ref(1);
const customDate = ref(false);
function fxNames(on: Conditions, off: Conditions): string[] {
  const B = new Set(buildPrep(off).map(i => i.name));
  return buildPrep(on).filter(i => !B.has(i.name)).map(i => i.name);
}
const dstr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function setOffset(n: number) { const d = new Date(); d.setDate(d.getDate() + n); draft.date = dstr(d); customDate.value = false; }
function isOffset(n: number) { const d = new Date(); d.setDate(d.getDate() + n); return draft.date === dstr(d); }
const fxChildren = computed(() => fxNames(
  { ...draft, children: draft.children, childAge: draft.childAge },
  { ...draft, children: 0 },
));
const fxElderly = computed(() => fxNames({ ...draft, elderly: true }, { ...draft, elderly: false }));
const TOTAL = 6;

/** 入住日 + 晚数 = 退房日，给个即时反馈 */
const leaveLabel = computed(() => {
  if (!draft.date) return '';
  const [y, m, d] = draft.date.split('-').map(Number);
  const t = new Date(y, m - 1, d + draft.nights);
  return fmtDate(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`);
});

function defaultDraft(): Conditions {
  return { date: '', nights: 1, adults: 1, children: 0, childAge: '0-3', elderly: false, pet: false,
           purpose: '普通短住', prefs: { sleep: false, hygiene: false, mosquito: false, gadgets: false } };
}
const draft = reactive<Conditions>(defaultDraft());

const purposes: Purpose[] = ['普通短住', '出差', '旅游', '探亲'];
const ages: { v: ChildAge; t: string }[] = [
  { v: '0-3', t: '0–3 岁' }, { v: '4-6', t: '4–6 岁' }, { v: '7-12', t: '7–12 岁' }, { v: '13+', t: '13 岁以上' },
];

// 预览用 ref（不能用 computed：computed 重算会丢掉用户在预览页添加的自定义物品）
const preview = ref<PrepItem[]>([]);
const previewCats = computed(() => [...new Set(preview.value.map(i => i.cat))]);
const conditionEffects = computed(() => {
  const out: { cond: string; items: string }[] = [];
  if (draft.adults > 1) out.push({ cond: `${draft.adults} 人入住`, items: `每人份物品按 ${draft.adults} 份准备` });
  out.push({ cond: `${draft.nights} 晚`, items: draft.nights >= 4 ? `消耗品按 ${draft.nights + 1} 份/人，并加入洗衣、晾衣用品` : `消耗品按 ${draft.nights + 1} 份/人` });
  if (draft.children > 0) {
    const c = fxNames({ ...draft, children: draft.children, childAge: draft.childAge }, { ...draft, children: 0 });
    if (c.length) out.push({ cond: `儿童 ${draft.children} 位（${draft.childAge} 岁）`, items: c.join('、') });
  }
  if (draft.elderly) {
    const o = fxNames({ ...draft, elderly: true }, { ...draft, elderly: false });
    if (o.length) out.push({ cond: '有老人', items: o.join('、') });
  }
  const pOn = (k: 'sleep' | 'hygiene' | 'mosquito' | 'gadgets', label: string) => {
    const o = fxNames({ ...draft, prefs: { ...draft.prefs, [k]: true } }, { ...draft, prefs: { ...draft.prefs, [k]: false } });
    if (o.length) out.push({ cond: label, items: o.join('、') });
  };
  if (draft.prefs.sleep) pOn('sleep', '睡眠敏感');
  if (draft.prefs.hygiene) pOn('hygiene', '在意卫生');
  if (draft.prefs.mosquito) pOn('mosquito', '蚊虫季节');
  if (draft.prefs.gadgets) pOn('gadgets', '电子设备多');
  return out;
});

const customName = ref('');
const customQty = ref(1);
function addCustom() {
  const name = customName.value.trim();
  if (!name) return;
  preview.value.push({ name, cat: '自定义', unit: '件', prep: '自定义', source: '自定义', users: '共用', qty: customQty.value || 1, done: false });
  customName.value = ''; customQty.value = 1;
}
function removeCustom(item: PrepItem) {
  const i = preview.value.indexOf(item);
  if (i >= 0) preview.value.splice(i, 1);
}
function addClothing(name: string) {
  if (preview.value.some(i => i.cat === '衣物' && i.name === name)) return;
  preview.value.push({ name, cat: '衣物', unit: '件', prep: '家里带', source: '自定义', users: '每人', qty: 1, done: false });
}
function next() {
  if (step.value === 5) preview.value = sortItems(buildPrep(draft));
  step.value++;
}
function save() {
  const s = newStay(JSON.parse(JSON.stringify(draft)) as Conditions, JSON.parse(JSON.stringify(preview.value)));
  saveStay(s);
  openStay(s.id, true);
}
</script>

<template>
  <header class="wiz-head">
    <button v-if="step > 1 && step < TOTAL" class="icon-btn" aria-label="上一步" @click="step--"><ArrowLeft :size="18" /></button>
    <button v-else-if="step === TOTAL" class="icon-btn" aria-label="上一步" @click="step--"><ArrowLeft :size="18" /></button>
    <span v-else></span>
    <div class="track"><i :style="{ width: (step / TOTAL * 100) + '%' }"></i></div>
    <span class="num stepno">{{ step }}<small>/{{ TOTAL }}</small></span>
  </header>

  <!-- ① 日期与晚数 -->
  <template v-if="step === 1">
    <h2 class="q">什么时候入住？</h2>
    <div class="glass card">
      <div class="datebig num">{{ draft.date ? fmtDate(draft.date) : '先选好日子' }}</div>
      <p v-if="leaveLabel" class="muted leave">退房 {{ leaveLabel }} · 共 {{ draft.nights }} 晚</p>
      <div class="quickrow">
        <button type="button" class="qchip" :class="{ on: !customDate && isOffset(0) }" @click="setOffset(0)">今天</button>
        <button type="button" class="qchip" :class="{ on: !customDate && isOffset(1) }" @click="setOffset(1)">明天</button>
        <button type="button" class="qchip" :class="{ on: !customDate && isOffset(2) }" @click="setOffset(2)">后天</button>
        <button type="button" class="qchip" :class="{ on: customDate }" @click="customDate = !customDate">自选日期</button>
      </div>
      <div v-if="customDate" class="dslot">
        <DatePicker v-model="draft.date" />
      </div>
      <div class="nightsrow">
        <span class="fl"><Compass :size="16" />住几晚</span>
        <Stepper v-model="draft.nights" :min="1" :max="30" unit="晚" />
      </div>
      <p class="muted hint">晚数 ≥ 4 会自动加入长住物品（洗衣、晾衣）。</p>
    </div>
  </template>

  <!-- ② 人数 -->
  <template v-else-if="step === 2">
    <h2 class="q">这次有几个人入住？</h2>
    <div class="glass card">
      <div class="chips">
        <button v-for="n in [1, 2, 3]" :key="n" class="chip" :class="{ on: draft.adults === n || (n === 3 && draft.adults > 3) }" @click="draft.adults = Math.max(draft.adults, n)">
          <Users :size="16" />{{ n === 3 ? '3 人及以上' : `${n} 人` }}
        </button>
      </div>
      <template v-if="draft.adults >= 3">
        <p class="fxline">几人入住就按几人准备，请确认真实人数</p>
        <div class="nights">
          <Stepper v-model="draft.adults" :min="3" :max="10" unit="人" />
        </div>
      </template>
    </div>
  </template>

  <!-- ③ 同行人员 -->
  <template v-else-if="step === 3">
    <h2 class="q">谁和你同行？</h2>
    <div class="glass card">
      <div class="fl"><Baby :size="16" />儿童</div>
      <div class="nights">
        <Stepper v-model="draft.children" :min="0" :max="4" unit="个" />
      </div>
      <template v-if="draft.children > 0">
        <div class="fl" style="margin-top:16px">年龄段</div>
        <div class="chips">
          <button v-for="a in ages" :key="a.v" class="chip" :class="{ on: draft.childAge === a.v }" @click="draft.childAge = a.v">{{ a.t }}</button>
        </div>
        <p class="fxline">＋将加入：{{ fxChildren.join('、') }}</p>
      </template>
      <div class="switch-rows">
        <div class="srowwrap">
          <div class="srow"><span class="slabel">有老人同行</span><Toggle v-model="draft.elderly" /></div>
          <p v-if="draft.elderly" class="fxline">＋将加入：{{ fxElderly.join('、') }}</p>
        </div>
        <div class="srow"><span class="slabel">有宠物同行<span v-if="draft.pet" class="muted">（用品稍后自行添加）</span></span><Toggle v-model="draft.pet" /></div>
      </div>
    </div>
  </template>

  <!-- ④ 场景 -->
  <template v-else-if="step === 4">
    <h2 class="q">这次住宿属于哪种情况？</h2>
    <div class="glass card">
      <div class="chips">
        <button v-for="p in purposes" :key="p" class="chip" :class="{ on: draft.purpose === p }" @click="draft.purpose = p">{{ p }}</button>
      </div>
    </div>
  </template>

  <!-- ⑤ 偏好 -->
  <template v-else-if="step === 5">
    <h2 class="q">你在意哪些方面？<small class="muted">选中的会加进清单，之后随时可改</small></h2>
    <div class="glass card">
      <div class="srow"><span class="slabel"><Moon :size="16" class="sicon" />睡眠敏感</span><Toggle v-model="draft.prefs.sleep" /></div>
      <p v-if="draft.prefs.sleep" class="fxline">＋将加入：眼罩、耳塞</p>
      <div class="srow"><span class="slabel"><Droplets :size="16" class="sicon" />在意卫生</span><Toggle v-model="draft.prefs.hygiene" /></div>
      <p v-if="draft.prefs.hygiene" class="fxline">＋将加入：一次性床单/隔脏睡袋</p>
      <div class="srow"><span class="slabel"><Bug :size="16" class="sicon" />蚊虫季节</span><Toggle v-model="draft.prefs.mosquito" /></div>
      <p v-if="draft.prefs.mosquito" class="fxline">＋将加入：驱蚊液/花露水</p>
      <div class="srow"><span class="slabel"><Plug :size="16" class="sicon" />电子设备多</span><Toggle v-model="draft.prefs.gadgets" /></div>
      <p v-if="draft.prefs.gadgets" class="fxline">＋将加入：氮化镓多口充电器、USB 数据阻断器、魔方插座</p>
    </div>
  </template>

  <!-- ⑥ 确认清单 -->
  <template v-else>
    <h2 class="q">确认清单<small class="muted">可改数量、可删，保存后也能随时加东西</small></h2>
    <div class="glass card fxcards">
      <div class="think-title"><SlidersHorizontal :size="15" />这些选择如何影响清单</div>
      <div v-for="(fx, i) in conditionEffects" :key="i" class="hint-row">
        <span class="fxcond">{{ fx.cond }}</span><span class="muted">{{ fx.items }}</span>
      </div>
      <div class="hint-row"><span class="fxcond">数量规则</span><span class="muted">消耗品 = 人数 ×（晚数 + 1），上衣每人封顶 4 件，均可手动调整</span></div>
    </div>
    <template v-for="cat in previewCats" :key="cat">
      <div class="sec-label">{{ cat }}</div>
      <div class="glass card">
        <ItemRow v-for="it in preview.filter(i => i.cat === cat)" :key="it.name" :item="it" :editable="false" :removable="it.source === '自定义'" @remove="removeCustom(it)" />
        <ClothingAdd v-if="cat === '衣物'" @add="addClothing" />
      </div>
    </template>
    <div class="glass card think">
      <div class="think-title"><SlidersHorizontal :size="15" />还有一些东西，只有你自己知道</div>
      <div v-for="h in HINTS" :key="h.text" class="hint-row">
        <component :is="HINT_ICONS[h.icon]" :size="15" class="hicon" />
        <span class="muted">{{ h.text }}</span>
      </div>
      <div class="addrow">
        <input v-model="customName" type="text" class="field" placeholder="物品名，如：相机电池">
        <input v-model.number="customQty" type="number" min="1" class="field qtyin num" title="数量">
        <button class="btn small" @click="addCustom"><Plus :size="16" /></button>
      </div>
    </div>
  </template>

  <!-- 底部动作 -->
  <button v-if="step < TOTAL" class="btn" @click="next()">{{ step === 1 ? '开始' : '下一步' }}<ChevronRight :size="17" /></button>
  <button v-else class="btn" @click="save">保存这次入住</button>
  <button v-if="step === TOTAL" class="btn plain" @click="step--">返回修改</button>
</template>

<style scoped>
.wiz-head { display: flex; align-items: center; gap: 14px; margin: 8px 0 18px; }
.track { flex: 1; height: 4px; border-radius: 99px; background: rgba(35, 41, 37, 0.1); overflow: hidden; }
.track i { display: block; height: 100%; background: linear-gradient(90deg, var(--gold), #c8a95c); border-radius: 99px; transition: width 0.25s ease; }
.stepno { font-size: 15px; font-weight: 650; color: var(--pine-deep); }
.stepno small { color: var(--ink-3); font-weight: 400; font-size: 12px; }
.q { font-size: 21px; margin: 6px 2px 14px; font-weight: 650; }
.q small { display: block; font-size: 13px; color: var(--ink-2); font-weight: 400; margin-top: 5px; font-family: var(--sans); letter-spacing: 0; }
.card { padding: 18px; }
.fl { display: flex; align-items: center; gap: 7px; font-size: 14px; color: var(--ink-2); margin-bottom: 9px; }
.datebig { font-size: 21px; font-weight: 700; color: var(--pine-deep); margin-bottom: 3px; }
.leave { margin: 0 0 8px; }
.quickrow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0 12px; }
.qchip {
  min-height: 40px; padding: 0 8px; border-radius: 11px; cursor: pointer;
  border: 1.5px solid var(--glass-border); background: rgba(255, 255, 255, 0.6);
  font-size: 14.5px; color: var(--ink); transition: all 0.15s;
  white-space: nowrap; /* 不再让「自选日期」被折断成 3+1 */
}
.qchip.on { border-color: var(--pine); background: rgba(28, 90, 74, 0.1); color: var(--pine-deep); font-weight: 650; }
/* 手机窄屏：4 颗挤在一排每颗只剩 ~57px，「自选日期」会被折断 → 改 2×2；
   同时收紧卡片与月历内边距，把宽度让给日期格 */
@media (max-width: 480px) {
  .card { padding: 14px; }
  .quickrow { grid-template-columns: repeat(2, 1fr); }
  .qchip { min-height: 44px; }
  .dslot { padding: 12px 6px 10px; }
}
.dslot {
  margin: 4px 0 16px; padding: 12px 10px 10px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.42);
  border: 1px solid var(--hairline);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
.nightsrow { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.hint { margin: 12px 0 0; }
.fxline { margin: 6px 0 2px; font-size: 12.5px; color: var(--pine-deep); background: rgba(28, 90, 74, 0.07); border-radius: 8px; padding: 6px 10px; }
.fxcards { margin-bottom: 14px; }
.fxcond { flex-shrink: 0; font-weight: 650; color: var(--ink); font-size: 12.5px; min-width: 96px; }
.nights { display: flex; align-items: center; }
.chips { display: flex; flex-wrap: wrap; gap: 10px; }
.chip {
  display: inline-flex; align-items: center; gap: 7px;
  min-height: 46px; padding: 0 18px; cursor: pointer;
  border-radius: 14px; border: 1.5px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.5); font-size: 15.5px; color: var(--ink);
  transition: all 0.16s;
}
.chip.on {
  border-color: var(--pine); color: var(--pine-deep); font-weight: 650;
  background: linear-gradient(150deg, rgba(28, 90, 74, 0.14), rgba(28, 90, 74, 0.05));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
.chip.on::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--pine); }
.switch-rows { margin-top: 16px; border-top: 1px dashed var(--hairline); padding-top: 6px; }
.srow { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 0; }
.slabel { display: inline-flex; align-items: center; gap: 8px; font-size: 15.5px; }
.sicon { color: var(--pine); }
.think { margin-top: 16px; }
.think-title { display: flex; align-items: center; gap: 8px; font-weight: 650; font-size: 15px; margin-bottom: 4px; }
.think-title svg { color: var(--gold); }
.hint-row { display: flex; align-items: center; gap: 9px; padding: 6px 0; }
.hicon { color: var(--pine); flex-shrink: 0; }
.addrow { display: flex; gap: 8px; margin-top: 10px; }
.addrow .field:first-child { flex: 1; }
.qtyin { width: 64px; }
</style>
