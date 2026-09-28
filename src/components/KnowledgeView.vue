<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { AlertTriangle, ChevronRight, Copy, ShieldAlert, Siren } from 'lucide-vue-next';
import { DISCLAIMER, EVIDENCE_META, KNOWLEDGE, RISK_META } from '../data';
import { backToStay, currentStay, knowModule, knowReturnTo } from '../store';
import { esc } from '../fmt';

const modules = [...new Set(KNOWLEDGE.map(k => k.module))];
const evidenceTone: Record<string, string> = { law: 'blue', official: 'green', pro: 'purple', experience: 'gray' };
/** 每个模块有多少条，用于在区块标题上标出，方便扫读 */
const countOf = (m: string) => KNOWLEDGE.filter(k => k.module === m).length;

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
    <button v-if="knowReturnTo === 'stay' && currentStay" class="backbtn glass" @click="backToStay()">← 返回行程</button>
    <div class="glass disclaimer">
      <div class="d-title"><ShieldAlert :size="16" class="d-icon" />{{ DISCLAIMER.title }}</div>
      <ul class="d-list">
        <li v-for="(l, i) in DISCLAIMER.lines" :key="i" v-html="rich(l)"></li>
      </ul>
      <div class="d-alert">
        <span class="d-alert-t"><Siren :size="14" />触发即处理</span>
        <p v-html="rich(DISCLAIMER.triggers)"></p>
      </div>
    </div>

    <div class="glass legend">
      <div class="leg-head">等级图例</div>
      <div class="leg-block">
        <div class="leg-t">证据来源<em>方块</em></div>
        <div class="leg-items">
          <span v-for="(m, k) in EVIDENCE_META" :key="k" class="leg-i"><span class="dot sq" :class="evidenceTone[k]"></span>{{ m.label }}</span>
        </div>
      </div>
      <div class="leg-block">
        <div class="leg-t">风险等级<em>圆点</em></div>
        <div class="leg-items">
          <span v-for="(m, k) in RISK_META" :key="k" class="leg-i"><span class="dot" :class="m.tone"></span>{{ m.label }}</span>
        </div>
      </div>
      <p class="leg-note num">共 {{ KNOWLEDGE.length }} 条 · 按 {{ modules.length }} 个模块分组</p>
    </div>

    <template v-for="m in modules" :key="m">
      <div class="sec-label">{{ m }}<em class="cnt num">{{ countOf(m) }} 条</em></div>
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
.backbtn { display: inline-flex; align-items: center; width: 100%; min-height: 44px; margin: 8px 0 10px; padding: 0 16px; border-radius: 13px; cursor: pointer; font-size: 14px; color: var(--pine-deep); }
.disclaimer { padding: 16px 18px; margin-top: 6px; border-color: rgba(169, 133, 61, 0.4); }
.d-title { display: flex; align-items: center; gap: 7px; font-weight: 700; font-size: 15px; }
.d-icon { color: var(--gold); }
/* 原来是 4 段平铺的段落，改成分条列表：条目之间有呼吸、有引导线 */
.d-list { margin: 10px 0 0; padding: 0; list-style: none; }
.d-list li {
  position: relative; padding-left: 14px; margin-bottom: 7px;
  font-size: 13.5px; line-height: 1.7; color: #3b4340;
}
.d-list li:last-child { margin-bottom: 0; }
.d-list li::before {
  content: ""; position: absolute; left: 0; top: 9px;
  width: 5px; height: 5px; border-radius: 50%; background: var(--gold); opacity: 0.75;
}
.d-list :deep(strong) { font-weight: 700; color: var(--ink); }
.d-alert {
  margin-top: 12px; padding: 10px 12px; border-radius: 12px;
  background: rgba(178, 58, 50, 0.07); border: 1px solid rgba(178, 58, 50, 0.22);
}
.d-alert-t {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 700; color: var(--red); margin-bottom: 4px;
}
.d-alert p { margin: 0; font-size: 13px; line-height: 1.65; color: #4a3f3d; }
.d-alert :deep(strong) { color: var(--red); font-weight: 700; }

/* —— 图例：证据（方块）/ 风险（圆点）分块，形状即维度 —— */
.legend { padding: 14px 18px 12px; margin-top: 12px; }
.leg-head {
  font-size: 11px; font-weight: 650; letter-spacing: 0.16em;
  color: var(--ink-3); text-transform: uppercase; margin-bottom: 10px;
}
.leg-block + .leg-block { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--hairline); }
.leg-t {
  display: flex; align-items: center; gap: 6px;
  font-weight: 650; color: var(--ink); font-size: 12.5px; margin-bottom: 7px;
}
.leg-t em {
  font-style: normal; font-weight: 500; font-size: 11px; color: var(--ink-3);
  border: 1px solid var(--hairline); border-radius: 99px; padding: 1px 7px;
}
.leg-items { display: flex; flex-wrap: wrap; gap: 6px 8px; }
.leg-i {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12.5px; color: var(--ink-2);
  padding: 4px 10px 4px 8px; border-radius: 99px;
  border: 1px solid var(--hairline); background: rgba(255, 255, 255, 0.45);
}
.leg-note { margin: 10px 0 0; font-size: 11.5px; color: var(--ink-3); }
.cnt { margin-left: auto; font-style: normal; font-size: 11.5px; font-weight: 500; color: var(--ink-3); }
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
