<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronRight, Copy, Download, Plus, Upload } from 'lucide-vue-next';
import { buildPrep, exportData, importData, listStays, newStay, saveStay, sortItems } from '../engine';
import type { Stay } from '../types';
import { fmtDate, goWizard, openStay, stayPhaseLabel } from '../store';

const stays = ref<Stay[]>([...listStays()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
const backupMsg = ref('');

function doExport() {
  const blob = new Blob([exportData()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  a.href = url;
  a.download = `hotel-toolbox-backup-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`;
  a.click();
  URL.revokeObjectURL(url);
  backupMsg.value = '已导出备份文件';
}
function onImportFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  file.text().then(text => {
    try {
      const r = importData(text);
      stays.value = [...listStays()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      backupMsg.value = `已导入 ${r.stays} 个行程、${r.gear} 组好物`;
    } catch (err) {
      backupMsg.value = err instanceof Error ? err.message : '导入失败';
    }
  });
}

function copyLast() {
  const last = stays.value[0];
  if (!last) return;
  const s = newStay(last.conditions, buildPrep(last.conditions));
  s.custom = JSON.parse(JSON.stringify(last.custom));
  s.custom.forEach(i => { i.done = false; });
  saveStay(s);
  openStay(s.id);
}

function summary(s: Stay) {
  const items = sortItems([...s.prep, ...s.custom]);
  return { done: items.filter(i => i.done).length, total: items.length };
}
const hasStays = computed(() => stays.value.length > 0);
const totalNights = computed(() => stays.value.reduce((n, s) => n + s.nights, 0));
const avgPacked = computed(() => {
  if (!stays.value.length) return 0;
  const all = stays.value.flatMap(s => [...s.prep, ...s.custom]);
  const done = all.filter(i => i.done).length;
  return all.length ? Math.round(done * 100 / all.length) : 0;
});
</script>

<template>
  <!-- 刊头：编辑风，无底色卡片 -->
  <header class="masthead">
    <p class="overline num">Hotel Stay Toolbox</p>
    <h1 class="display">酒店入住工具箱</h1>
    <span class="gold-rule" aria-hidden="true"></span>
    <p class="tagline">让每一次入住，都少一点遗漏，多一点准备</p>
    <button class="btn" @click="goWizard()"><Plus :size="16" />创建一次入住</button>
  </header>

  <!-- 空状态 -->
  <div v-if="!hasStays" class="empty">
    <p class="empty-line display">旅程，从一次从容的入住开始</p>
    <p class="muted">回答 5 个小问题，生成这次入住的准备清单（含数量）</p>
    <p class="muted dim">数据只保存在本机浏览器</p>
  </div>

  <template v-if="hasStays">
    <!-- 统计条 -->
    <div class="statrow glass">
      <div class="stat"><b class="num">{{ stays.length }}</b><span>次入住</span></div>
      <i class="vsep"></i>
      <div class="stat"><b class="num">{{ totalNights }}</b><span>晚住宿</span></div>
      <i class="vsep"></i>
      <div class="stat"><b class="num">{{ avgPacked }}<small>%</small></b><span>平均备齐</span></div>
    </div>

    <div class="sechead">
      <h2 class="sec-label">最近的入住</h2>
      <button class="copylink" @click="copyLast"><Copy :size="13" />复制上次</button>
    </div>
    <article v-for="(s, idx) in stays" :key="s.id" class="staycard glass" @click="openStay(s.id)">
      <span class="key num">{{ String(idx + 1).padStart(2, '0') }}</span>
      <div class="grow">
        <div class="sc-date num">{{ fmtDate(s.date) }}<span class="nights"> · {{ s.nights }} 晚</span></div>
        <div class="meta muted">
          {{ s.conditions.purpose }}<template v-if="s.conditions.children"> · {{ s.conditions.children }} 个儿童</template><template v-if="s.conditions.elderly"> · 有老人</template>
        </div>
        <div class="miniline"><i :style="{ width: (summary(s).total ? Math.round(summary(s).done * 100 / summary(s).total) : 0) + '%' }"></i></div>
        <div class="tiny num">{{ summary(s).done }} / {{ summary(s).total }} 已备齐</div>
      </div>
      <div class="sc-side">
        <span v-if="stayPhaseLabel(s)" class="phase">{{ stayPhaseLabel(s) }}</span>
        <ChevronRight :size="17" class="chev" />
      </div>
    </article>
  </template>

  <!-- 备份与恢复（低存在感的工具项） -->
  <details class="backup">
    <summary><Download :size="13" />备份与恢复</summary>
    <p class="muted">数据只存在本机浏览器。导出的 JSON 文件可在换设备或重装浏览器后导入恢复。</p>
    <div class="backuprow">
      <button class="btn small" @click="doExport"><Download :size="14" />导出备份</button>
      <label class="btn small ghost filebtn"><Upload :size="14" />导入备份<input type="file" accept=".json,application/json" @change="onImportFile"></label>
    </div>
    <p v-if="backupMsg" class="muted bmsg">{{ backupMsg }}</p>
  </details>
</template>

<style scoped>
/* —— 刊头：编辑风 —— */
.masthead { padding: 30px 6px 8px; text-align: left; }
.overline {
  font-size: 11px; letter-spacing: 0.34em; text-transform: uppercase;
  color: var(--gold); margin: 0 0 14px; font-weight: 600;
}
.masthead h1 { font-family: var(--serif); font-size: 33px; font-weight: 700; letter-spacing: 0.04em; margin: 0; color: var(--ink); }
.gold-rule { display: block; width: 44px; height: 2px; background: linear-gradient(90deg, var(--gold), rgba(201, 162, 39, 0.25)); margin: 16px 0 14px; border-radius: 2px; }
.tagline { margin: 0 0 24px; font-size: 14px; color: var(--ink-2); letter-spacing: 0.02em; }

/* —— 空状态 —— */
.empty { text-align: center; padding: 40px 24px 30px; margin-top: 10px; }
.empty-line { font-size: 17px; color: var(--ink); margin: 0 0 10px; letter-spacing: 0.06em; }
.empty p.muted { margin: 6px 0; }
.empty .dim { opacity: 0.65; font-size: 12.5px; }

/* —— 统计条 —— */
.statrow { display: flex; align-items: stretch; padding: 14px 10px; margin: 18px 0 4px; }
.stat { flex: 1; text-align: center; display: flex; flex-direction: column; gap: 2px; }
.stat b { font-size: 20px; font-weight: 700; color: var(--pine-deep); }
.stat b small { font-size: 12px; font-weight: 600; }
.stat span { font-size: 11.5px; color: var(--ink-2); }
.vsep { width: 1px; background: var(--hairline); }

/* —— 区块头 + 复制上次 —— */
.sechead { display: flex; align-items: center; justify-content: space-between; margin: 22px 4px 8px; }
.sechead .sec-label { margin: 0; }
.copylink {
  display: inline-flex; align-items: center; gap: 5px;
  border: 0; background: none; cursor: pointer; padding: 4px 2px;
  font-size: 12.5px; color: var(--pine-deep);
}
.copylink:active { opacity: 0.6; }

/* —— 行程卡（房卡登记簿式）—— */
.staycard { display: flex; gap: 14px; padding: 16px; margin: 10px 0; cursor: pointer; transition: border-color 0.15s; }
.staycard:hover { border-color: var(--gold); }
.key {
  flex-shrink: 0; width: 40px; height: 40px; border-radius: 11px;
  display: grid; place-content: center;
  font-size: 14px; font-weight: 700; color: var(--pine-deep);
  border: 1px solid rgba(169, 133, 61, 0.35); background: rgba(201, 162, 39, 0.08);
}
.sc-date { font-size: 16px; font-weight: 700; color: var(--ink); white-space: nowrap; }
.nights { font-weight: 400; color: var(--ink-2); font-size: 13px; }
.miniline { height: 4px; border-radius: 99px; background: rgba(35, 41, 37, 0.08); overflow: hidden; margin-top: 8px; }
.miniline i { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #2c7c66, var(--pine)); transition: width 0.3s; }
.tiny { font-size: 11.5px; color: var(--ink-2); margin-top: 4px; }
.sc-side { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; flex-shrink: 0; }
.phase {
  font-size: 11px; padding: 3px 9px; border-radius: 99px;
  color: var(--pine-deep); background: rgba(28, 90, 74, 0.1); border: 1px solid rgba(28, 90, 74, 0.22);
}
.chev { color: var(--ink-3); }

/* —— 备份 —— */
.backup { margin-top: 26px; border: 0; background: none; padding: 0; }
.backup summary {
  display: flex; align-items: center; gap: 6px; cursor: pointer; list-style: none;
  font-size: 12.5px; color: var(--ink-3); padding: 8px 4px;
}
.backup summary::-webkit-details-marker { display: none; }
.backup[open] summary { color: var(--ink-2); }
.backup p.muted { font-size: 12.5px; margin: 8px 0; }
.backuprow { display: flex; gap: 10px; margin-top: 8px; }
.filebtn { position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 6px; }
.filebtn input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.bmsg { margin-top: 8px; }
</style>
