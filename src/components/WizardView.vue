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
const dstr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function setOffset(n: number) { const d = new Date(); d.setDate(d.getDate() + n); draft.date = dstr(d); customDate.value = false; }
function isOffset(n: number) { const d = new Date(); d.setDate(d.getDate() + n); return draft.date === dstr(d); }
const TOTAL = 6;

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
  openStay(s.id);
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
      <div class="quickrow">
        <button type="button" class="qchip" :class="{ on: isOffset(0) }" @click="setOffset(0)">今天</button>
        <button type="button" class="qchip" :class="{ on: isOffset(1) }" @click="setOffset(1)">明天</button>
        <button type="button" class="qchip" :class="{ on: isOffset(2) }" @click="setOffset(2)">后天</button>
        <button type="button" class="qchip" :class="{ on: isOffset(-1) }" @click="customDate = true">自选日期</button>
      </div>
      <input v-if="customDate" v-model="draft.date" type="date" class="field datefield">
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
        <button v-for="n in [1, 2, 3]" :key="n" class="chip" :class="{ on: draft.adults === n }" @click="draft.adults = n">
          <Users :size="16" />{{ n === 3 ? '3 人及以上' : `${n} 人` }}
        </button>
      </div>
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
      </template>
      <div class="switch-rows">
        <div class="srow"><span class="slabel">有老人同行</span><Toggle v-model="draft.elderly" /></div>
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
      <div class="srow"><span class="slabel"><Droplets :size="16" class="sicon" />在意卫生</span><Toggle v-model="draft.prefs.hygiene" /></div>
      <div class="srow"><span class="slabel"><Bug :size="16" class="sicon" />蚊虫季节</span><Toggle v-model="draft.prefs.mosquito" /></div>
      <div class="srow"><span class="slabel"><Plug :size="16" class="sicon" />电子设备多</span><Toggle v-model="draft.prefs.gadgets" /></div>
    </div>
  </template>

  <!-- ⑥ 确认清单 -->
  <template v-else>
    <h2 class="q">确认清单<small class="muted">可改数量、可删，保存后也能随时加东西</small></h2>
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
.datebig { font-size: 21px; font-weight: 700; color: var(--pine-deep); margin-bottom: 12px; }
.quickrow { display: flex; gap: 8px; margin: 12px 0 12px; }
.qchip {
  flex: 1; min-height: 40px; border-radius: 11px; cursor: pointer;
  border: 1.5px solid var(--glass-border); background: rgba(255, 255, 255, 0.6);
  font-size: 14.5px; color: var(--ink); transition: all 0.15s;
}
.qchip.on { border-color: var(--pine); background: rgba(28, 90, 74, 0.1); color: var(--pine-deep); font-weight: 650; }
.datefield { margin-top: 12px; }
.nightsrow { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.hint { margin: 12px 0 0; }
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
