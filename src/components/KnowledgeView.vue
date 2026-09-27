<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { AlertTriangle, ChevronRight, Copy, ShieldAlert } from 'lucide-vue-next';
import { DISCLAIMER, EVIDENCE_META, KNOWLEDGE, RISK_META } from '../data';
import { knowModule } from '../store';
import { esc } from '../fmt';

const modules = [...new Set(KNOWLEDGE.map(k => k.module))];
const evidenceTone: Record<string, string> = { law: 'blue', official: 'green', pro: 'gold', experience: 'gray' };

// body 支持 \n 段落与 **加粗**：先转义再替换，安全输出
function rich(s: string): string {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
const paras = (body: string) => body.split('\n').filter(Boolean);

// 复核提醒：法规时效性条目到期后在摘要旁显示标记
function needsReview(k: { reviewBy?: string }): boolean {
  if (!k.reviewBy) return false;
  const [y, m] = k.reviewBy.split('-').map(Number);
  return new Date() >= new Date(y, m - 1, 1);
}

// 打开时若有锚点模块（紧急入口/检查组互链）：滚动定位并展开该模块
const root = ref<HTMLElement | null>(null);
if (knowModule.value) {
  void nextTick(() => {
    const card = root.value?.querySelector(`[data-module="${knowModule.value}"]`);
    card?.scrollIntoView({ block: 'start' });
    card?.querySelectorAll('details').forEach(d => d.setAttribute('open', ''));
  });
}

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
  <div ref="root">
    <div class="glass disclaimer">
      <div class="d-title"><ShieldAlert :size="16" class="d-icon" />{{ DISCLAIMER.title }}</div>
      <p v-for="(l, i) in DISCLAIMER.lines" :key="i" class="d-line" v-html="rich(l)"></p>
      <p class="d-trigger" v-html="rich(DISCLAIMER.triggers)"></p>
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
      <div class="glass card" :data-module="m">
        <details v-for="k in KNOWLEDGE.filter(x => x.module === m)" :key="k.id" :open="knowModule === m || undefined">
          <summary>
            <span class="dot" :class="RISK_META[k.risk].tone"></span>
            <span class="ktitle">{{ k.title }}</span>
            <span v-if="needsReview(k)" class="review"><AlertTriangle :size="12" />建议复核</span>
            <ChevronRight :size="16" class="chev" />
          </summary>
          <div class="body">
            <p v-for="(p, i) in paras(k.body)" :key="i" v-html="rich(p)"></p>
          </div>
          <div class="src">
            <span>证据 {{ EVIDENCE_META[k.evidence].label }} ｜ 来源：{{ k.source }} ｜ 核查于 {{ k.updated }}</span>
            <button v-if="k.copy" class="copybtn" @click.prevent="copyEntry(k)">
              <Copy :size="13" />{{ copiedId === k.id ? '已复制' : '复制话术' }}
            </button>
          </div>
        </details>
      </div>
    </template>
  </div>
</template>

<style scoped>
.disclaimer { padding: 15px 18px; margin-top: 6px; border-color: rgba(169, 133, 61, 0.4); }
.d-title { display: flex; align-items: center; gap: 7px; font-weight: 700; font-size: 15px; }
.d-icon { color: var(--gold); }
.d-line { margin: 9px 0 0; font-size: 14px; line-height: 1.65; color: #333b36; }
.d-line :deep(strong) { font-weight: 700; color: var(--ink); }
.d-trigger { margin: 10px 0 0; padding-top: 9px; border-top: 1px dashed var(--hairline); font-size: 13.5px; color: var(--ink-2); }
.d-trigger :deep(strong) { color: var(--red); font-weight: 700; }
.legend { padding: 14px 18px; margin-top: 12px; }
.leg-row { display: flex; flex-wrap: wrap; align-items: center; gap: 7px 14px; padding: 3px 0; font-size: 12.5px; color: var(--ink-2); }
.leg-t { font-weight: 650; color: var(--ink); margin-right: 2px; }
.leg-i { display: inline-flex; align-items: center; gap: 6px; }
.card { padding: 2px 18px; }
.ktitle { flex: 1; }
.chev { flex-shrink: 0; }
.review {
  display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;
  font-size: 11px; color: var(--amber, #b45309); border: 1px solid rgba(180, 83, 9, 0.3);
  padding: 1.5px 7px; border-radius: 99px;
}
.body { margin: 10px 2px 10px; font-size: 15px; line-height: 1.75; color: #343c36; }
.body p { margin: 0 0 9px; }
.body p:last-child { margin-bottom: 0; }
.body :deep(strong) { font-weight: 700; color: var(--ink); }
.src { font-size: 12px; color: var(--ink-2); border-top: 1px dashed var(--hairline); padding: 9px 0 12px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.copybtn {
  display: inline-flex; align-items: center; gap: 4px; margin-left: auto;
  padding: 3px 10px; border-radius: 99px; cursor: pointer;
  border: 1px solid var(--glass-border); background: rgba(255, 255, 255, 0.6);
  font-size: 12px; color: var(--pine-deep);
}
</style>
