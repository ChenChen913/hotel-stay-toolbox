<script setup lang="ts">
import { computed } from 'vue';
import { ChevronRight } from 'lucide-vue-next';
import { currentStay, goKnowledgeModule, persist } from '../store';
import { CHECKLISTS } from '../data';
import CheckGroupBlock from './CheckGroupBlock.vue';
import ProgressPill from './ProgressPill.vue';
import type { Stage } from '../types';

const props = defineProps<{ stage: Exclude<Stage, 'prep'> }>();
// computed：切换页签时组件被复用，清单必须跟随 stage 变化
const checklist = computed(() => CHECKLISTS[props.stage]);
const RISK_TONE = { high: 'red', mid: 'gold', low: 'green' } as const;
const stay = () => currentStay.value!;

function doneCount(): number {
  const arr = stay()[props.stage];
  return arr.reduce((n, g) => n + g.filter(Boolean).length, 0);
}
function totalCount(): number {
  return checklist.value.groups.reduce((n, g) => n + g.items.length, 0);
}
function set(gi: number, ii: number, v: boolean) {
  stay()[props.stage][gi][ii] = v;
  persist();
}
</script>

<template>
  <ProgressPill :done="doneCount()" :total="totalCount()" label="已完成" />
  <template v-for="(g, gi) in checklist.groups" :key="g.name">
    <div class="sec-label">
      <span class="dot" :class="RISK_TONE[g.risk]"></span>{{ g.name }}
      <button v-if="g.link" class="glink" @click="goKnowledgeModule(g.link, 'stay')">知识详解<ChevronRight :size="12" /></button>
    </div>
    <p v-if="g.note" class="gnote">{{ g.note }}</p>
    <div class="glass card">
      <CheckGroupBlock :items="g.items" :states="stay()[stage][gi]" @set="(ii: number, v: boolean) => set(gi, ii, v)" />
    </div>
  </template>
</template>

<style scoped>
.card { padding: 4px 18px; }
.sec-label .dot { flex-shrink: 0; }
.gnote { margin: -4px 4px 8px; font-size: 12.5px; color: var(--ink-2); }
.glink {
  display: inline-flex; align-items: center; gap: 1px;
  border: 0; background: none; cursor: pointer; padding: 0;
  font-size: 11.5px; letter-spacing: 0.05em; color: var(--pine-deep); font-family: var(--sans);
}
</style>
