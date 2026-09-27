<script setup lang="ts">
import { ref } from 'vue';
import { ChevronRight, Copy, ShieldAlert } from 'lucide-vue-next';
import { DISCLAIMER, EVIDENCE_META, KNOWLEDGE, RISK_META } from '../data';

const modules = [...new Set(KNOWLEDGE.map(k => k.module))];
const evidenceTone: Record<string, string> = { law: 'blue', official: 'green', pro: 'gold', experience: 'gray' };

const copiedId = ref<string | null>(null);
async function copyEntry(k: { id: string; copy?: string }) {
  if (!k.copy) return;
  try {
    await navigator.clipboard.writeText(k.copy);
    copiedId.value = k.id;
    setTimeout(() => { if (copiedId.value === k.id) copiedId.value = null; }, 1500);
  } catch { /* 剪贴板不可用时静默（如非安全上下文） */ }
}
</script>

<template>
  <div class="glass disclaimer">
    <div class="d-title"><ShieldAlert :size="16" class="d-icon" />先读这一段</div>
    <p class="d-body">{{ DISCLAIMER.body }}</p>
    <p class="d-trigger">{{ DISCLAIMER.triggers }}</p>
  </div>

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
        <div class="src">
          证据 {{ EVIDENCE_META[k.evidence].label }} ｜ 来源：{{ k.source }} ｜ 核查于 {{ k.updated }}
          <button v-if="k.copy" class="copybtn" @click.prevent="copyEntry(k)">
            <Copy :size="13" />{{ copiedId === k.id ? '已复制' : '复制话术' }}
          </button>
        </div>
      </details>
    </div>
  </template>
</template>

<style scoped>
.disclaimer { padding: 14px 18px; margin-top: 6px; border-color: rgba(169, 133, 61, 0.4); }
.d-title { display: flex; align-items: center; gap: 7px; font-weight: 650; font-size: 14.5px; }
.d-icon { color: var(--gold); }
.d-body { margin: 8px 0 0; font-size: 13.5px; color: #4a524c; }
.d-trigger { margin: 8px 0 0; font-size: 12.5px; color: var(--ink-2); }
.legend { padding: 14px 18px; margin-top: 12px; }
.leg-row { display: flex; flex-wrap: wrap; align-items: center; gap: 7px 14px; padding: 3px 0; font-size: 12.5px; color: var(--ink-2); }
.leg-t { font-weight: 650; color: var(--ink); margin-right: 2px; }
.leg-i { display: inline-flex; align-items: center; gap: 6px; }
.card { padding: 2px 18px; }
.ktitle { flex: 1; }
.chev { flex-shrink: 0; }
.copybtn {
  display: inline-flex; align-items: center; gap: 4px; margin-left: 8px;
  padding: 3px 10px; border-radius: 99px; cursor: pointer;
  border: 1px solid var(--glass-border); background: rgba(255, 255, 255, 0.6);
  font-size: 12px; color: var(--pine-deep);
}
</style>
