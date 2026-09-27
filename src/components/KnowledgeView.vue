<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';
import { EVIDENCE_META, KNOWLEDGE, RISK_META } from '../data';

const modules = [...new Set(KNOWLEDGE.map(k => k.module))];
const evidenceTone: Record<string, string> = { law: 'blue', official: 'green', pro: 'gold', experience: 'gray' };
</script>

<template>
  <div class="glass legend">
    <div class="leg-row">
      <span class="leg-t">证据</span>
      <span v-for="(m, k) in EVIDENCE_META" :key="k" class="leg-i"><span class="dot" :class="evidenceTone[k]"></span>{{ m.label }}</span>
    </div>
    <div class="leg-row">
      <span class="leg-t">风险</span>
      <span v-for="(m, k) in RISK_META" :key="k" class="leg-i"><span class="dot" :class="m.tone"></span>{{ m.label }}</span>
    </div>
  </div>

  <template v-for="m in modules" :key="m">
    <div class="sec-label">{{ m }}</div>
    <div class="glass card">
      <details v-for="k in KNOWLEDGE.filter(x => x.module === m)" :key="k.id">
        <summary>
          <span class="dot" :class="RISK_META[k.risk].tone"></span>
          <span class="ktitle">{{ k.title }}</span>
          <ChevronRight :size="16" class="chev" />
        </summary>
        <div class="body">{{ k.body }}</div>
        <div class="src">证据：{{ EVIDENCE_META[k.evidence].label }} ｜ 来源：{{ k.source }} ｜ 核查于 {{ k.updated }}</div>
      </details>
    </div>
  </template>
</template>

<style scoped>
.legend { padding: 14px 18px; margin-top: 6px; }
.leg-row { display: flex; flex-wrap: wrap; align-items: center; gap: 7px 14px; padding: 3px 0; font-size: 12.5px; color: var(--ink-2); }
.leg-t { font-weight: 650; color: var(--ink); margin-right: 2px; }
.leg-i { display: inline-flex; align-items: center; gap: 6px; }
.card { padding: 2px 18px; }
.ktitle { flex: 1; }
.chev { flex-shrink: 0; }
</style>
