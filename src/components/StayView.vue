<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowLeft, BedDouble, Briefcase, ChevronRight, DoorOpen, Plus, Trash2 } from 'lucide-vue-next';
import { CAT_ORDER, CUSTOM_HINTS } from '../data';
import { sortItems } from '../engine';
import type { PrepItem } from '../types';
import { currentStay, fmtDate, goHome, persist, removeCurrentStay, stage } from '../store';
import ItemRow from './ItemRow.vue';
import ProgressPill from './ProgressPill.vue';
import CheckStage from './CheckStage.vue';
import { HINT_ICON_MAP } from '../hint-icons';

const stay = () => currentStay.value!;

const prepGroups = computed(() => {
  const s = stay();
  const items = sortItems([...s.prep, ...s.custom]);
  const cats = [...new Set(items.map(i => i.cat))].sort((a, b) => CAT_ORDER.indexOf(a) - CAT_ORDER.indexOf(b));
  return cats.map(cat => ({ cat, items: items.filter(i => i.cat === cat) }));
});
// 使用人选项（聊04）：≥2 名成人或带儿童时出现，物品可绑定到人
const assignOptions = computed(() => {
  const s = stay();
  const opts = ['全体'];
  for (let i = 1; i <= s.conditions.adults; i++) opts.push(`入住人${i}`);
  if (s.conditions.children > 0) opts.push('儿童');
  return opts.length > 2 ? opts : (s.conditions.children > 0 ? opts : null);
});
const stageHint = computed(() => {
  const s = stay();
  const label = { prep: '准备', checkin: '入住', checkout: '退房' }[stage.value];
  return `按日期已为你定位到「${label}」阶段`;
});
const prepProgress = computed(() => {
  const s = stay();
  const items = sortItems([...s.prep, ...s.custom]);
  return { done: items.filter(i => i.done).length, total: items.length };
});

function removeItem(item: PrepItem) {
  const s = stay();
  s.prep = s.prep.filter(x => x !== item);
  s.custom = s.custom.filter(x => x !== item);
  persist();
}
const customName = ref('');
const customQty = ref(1);
function addCustom() {
  const name = customName.value.trim();
  if (!name) return;
  stay().custom.push({ name, cat: '自定义', unit: '件', prep: '自定义', source: '自定义', users: '共用', qty: customQty.value || 1, done: false });
  customName.value = ''; customQty.value = 1;
}
function delStay() {
  if (confirm('删除这次入住的所有记录？')) removeCurrentStay();
}
const fmtStay = () => fmtDate(stay().date);
</script>

<template>
  <header class="st-head">
    <button class="icon-btn" aria-label="返回" @click="goHome()"><ArrowLeft :size="18" /></button>
    <div class="grow">
      <div class="st-date display num">{{ fmtStay() }} · {{ stay().nights }} 晚</div>
      <div class="muted">{{ stay().conditions.purpose }} · {{ stageHint }}</div>
    </div>
  </header>

  <div class="seg">
    <button :class="{ on: stage === 'prep' }" @click="stage = 'prep'"><Briefcase :size="16" />准备</button>
    <button :class="{ on: stage === 'checkin' }" @click="stage = 'checkin'"><BedDouble :size="16" />入住</button>
    <button :class="{ on: stage === 'checkout' }" @click="stage = 'checkout'"><DoorOpen :size="16" />退房</button>
  </div>

  <!-- 准备 -->
  <template v-if="stage === 'prep'">
    <ProgressPill :done="prepProgress.done" :total="prepProgress.total" label="已备齐" />
    <template v-for="g in prepGroups" :key="g.cat">
      <div class="sec-label">{{ g.cat }}</div>
      <div class="glass card">
        <ItemRow v-for="it in g.items" :key="it.name" :item="it" :assign-options="assignOptions ?? undefined"
                 @toggle="(v: boolean) => { it.done = v; persist(); }" @remove="removeItem(it)" :removable="it.source === '自定义'" />
      </div>
    </template>
    <div class="glass card think">
      <div class="think-title">还有一些东西，只有你自己知道</div>
      <div v-for="h in CUSTOM_HINTS" :key="h.text" class="hint-row">
        <component :is="HINT_ICON_MAP[h.icon]" :size="15" class="hicon" />
        <span class="muted">{{ h.text }}</span>
      </div>
      <div class="addrow">
        <input v-model="customName" type="text" class="field" placeholder="添加我的必带物品">
        <input v-model.number="customQty" type="number" min="1" class="field qtyin num" title="数量">
        <button class="btn small" @click="addCustom"><Plus :size="16" /></button>
      </div>
    </div>
  </template>

  <!-- 入住 / 退房 -->
  <template v-else>
    <CheckStage :key="stage" :stage="stage" />
  </template>

  <button class="btn plain" @click="delStay"><Trash2 :size="15" />删除这次入住</button>
</template>

<style scoped>
.st-head { display: flex; align-items: center; gap: 10px; margin: 6px 0 14px; }
.st-date { font-size: 20px; font-weight: 650; }
.card { padding: 4px 18px; margin-bottom: 12px; }
.think { padding: 16px 18px; margin-top: 14px; }
.think-title { font-weight: 650; font-size: 15px; margin-bottom: 4px; }
.hint-row { display: flex; align-items: center; gap: 9px; padding: 5px 0; }
.hicon { color: var(--pine); flex-shrink: 0; }
.addrow { display: flex; gap: 8px; margin-top: 10px; }
.addrow .field:first-child { flex: 1; }
.qtyin { width: 64px; }
.chev { color: var(--ink-3); }
</style>
