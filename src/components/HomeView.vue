<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowRight, BedDouble, ChevronRight, Copy, Download, Luggage, Moon, ShieldCheck, Sparkles, Upload } from 'lucide-vue-next';
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
/** 日期拆成「月 / 日」两截，给左侧日历瓦片用 */
function tile(s: Stay) {
  if (!s.date) return { m: '—', d: '–' };
  const [, m, d] = s.date.split('-').map(Number);
  return { m: `${m}月`, d: String(d) };
}
function peopleLabel(s: Stay): string {
  const c = s.conditions;
  const n = c.adults + c.children + (c.elderly ? 1 : 0);
  return `${n} 人`;
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
  <!-- 订房 App 式 Hero：深绿玻璃 + 金色刊头 + 主 CTA -->
  <section class="hero glass-deep">
    <span class="hero-line num">HOTEL STAY TOOLBOX</span>
    <h1 class="hero-title display">酒店入住工具箱</h1>
    <span class="hero-rule" aria-hidden="true"></span>
    <p class="hero-tag">让每一次入住，都少一点遗漏，多一点准备</p>
    <button class="hero-cta" @click="goWizard()">
      <Sparkles :size="17" />
      <span>创建一次入住</span>
      <ArrowRight :size="16" class="cta-arrow" />
    </button>
  </section>

  <!-- 空状态 -->
  <div v-if="!hasStays" class="empty glass">
    <span class="empty-ico"><Luggage :size="24" /></span>
    <p class="empty-t display">旅程，从一次从容的入住开始</p>
    <p class="muted">回答 5 个小问题，生成这次入住的准备清单（含数量）</p>
    <p class="muted dim">数据只保存在本机浏览器</p>
  </div>

  <template v-if="hasStays">
    <!-- 统计条：图标 + 数字，订房 App 的概览感 -->
    <div class="statrow glass">
      <div class="stat">
        <span class="stat-ico"><BedDouble :size="15" /></span>
        <b class="num">{{ stays.length }}</b>
        <span class="stat-l">次入住</span>
      </div>
      <i class="vsep"></i>
      <div class="stat">
        <span class="stat-ico"><Moon :size="15" /></span>
        <b class="num">{{ totalNights }}</b>
        <span class="stat-l">晚住宿</span>
      </div>
      <i class="vsep"></i>
      <div class="stat">
        <span class="stat-ico"><ShieldCheck :size="15" /></span>
        <b class="num">{{ avgPacked }}<small>%</small></b>
        <span class="stat-l">平均备齐</span>
      </div>
    </div>

    <div class="sechead">
      <h2 class="sec-label">最近的入住</h2>
      <button class="copylink" @click="copyLast"><Copy :size="13" />复制上次</button>
    </div>

    <!-- 行程卡：日历瓦片 + 行程信息 + 进度，仿订房 App 的房型列表 -->
    <article v-for="s in stays" :key="s.id" class="staycard glass" @click="openStay(s.id)">
      <div class="tile">
        <span class="tile-m num">{{ tile(s).m }}</span>
        <b class="tile-d num">{{ tile(s).d }}</b>
      </div>
      <div class="grow">
        <div class="sc-top">
          <span class="sc-date num">{{ fmtDate(s.date) }}</span>
          <span v-if="stayPhaseLabel(s)" class="phase">{{ stayPhaseLabel(s) }}</span>
        </div>
        <div class="meta">
          <span class="mtag">{{ s.conditions.purpose }}</span>
          <span class="mtext">{{ s.nights }} 晚 · {{ peopleLabel(s) }}<template v-if="s.conditions.children"> · {{ s.conditions.children }} 儿童</template><template v-if="s.conditions.elderly"> · 有老人</template></span>
        </div>
        <div class="miniline"><i :style="{ width: (summary(s).total ? Math.round(summary(s).done * 100 / summary(s).total) : 0) + '%' }"></i></div>
        <div class="tiny num">{{ summary(s).done }} / {{ summary(s).total }} 已备齐</div>
      </div>
      <ChevronRight :size="18" class="chev" />
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
/* —— Hero：深绿玻璃，订房 App 的头部 —— */
.hero { padding: 26px 22px 22px; margin-top: 6px; }
.hero-line {
  display: block; font-size: 10.5px; font-weight: 600;
  letter-spacing: 0.32em; text-transform: uppercase;
  color: rgba(201, 168, 106, 0.95); margin-bottom: 12px;
}
.hero-title {
  margin: 0; font-size: 31px; font-weight: 700; letter-spacing: 0.05em;
  color: #f6f3ea; text-shadow: 0 2px 14px rgba(0, 0, 0, 0.18);
}
.hero-rule {
  display: block; width: 46px; height: 2px; border-radius: 2px; margin: 14px 0 12px;
  background: linear-gradient(90deg, #d8bb72, rgba(216, 187, 114, 0.15));
}
.hero-tag { margin: 0 0 20px; font-size: 13.5px; color: rgba(244, 241, 232, 0.78); letter-spacing: 0.02em; }
.hero-cta {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; min-height: 50px; padding: 0 18px; cursor: pointer;
  border: 0; border-radius: 15px;
  background: linear-gradient(165deg, #fffdf7, #f0e8d6);
  color: var(--pine-deep); font-size: 16px; font-weight: 650;
  box-shadow: 0 12px 26px -12px rgba(0, 0, 0, 0.45), inset 0 1px 0 #fff;
  transition: transform 0.16s ease;
}
.hero-cta:active { transform: scale(0.985); }
.cta-arrow { opacity: 0.55; }

/* —— 空状态 —— */
.empty { text-align: center; padding: 32px 22px 28px; margin-top: 14px; }
.empty-ico {
  display: inline-grid; place-content: center;
  width: 52px; height: 52px; border-radius: 16px; margin-bottom: 14px;
  color: var(--pine); background: rgba(28, 90, 74, 0.09);
  border: 1px solid rgba(28, 90, 74, 0.18);
}
.empty-t { font-size: 17px; color: var(--ink); margin: 0 0 8px; letter-spacing: 0.06em; }
.empty p.muted { margin: 6px 0; }
.empty .dim { opacity: 0.65; font-size: 12.5px; }

/* —— 统计条 —— */
.statrow { display: flex; align-items: stretch; padding: 14px 8px; margin: 14px 0 4px; }
.stat { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.stat-ico {
  display: inline-grid; place-content: center;
  width: 26px; height: 26px; border-radius: 9px; margin-bottom: 2px;
  color: var(--pine); background: rgba(28, 90, 74, 0.09);
}
.stat b { font-size: 19px; font-weight: 700; color: var(--pine-deep); line-height: 1.1; }
.stat b small { font-size: 12px; font-weight: 600; }
.stat-l { font-size: 11.5px; color: var(--ink-2); }
.vsep { width: 1px; background: var(--hairline); }

/* —— 区块头 + 复制上次 —— */
.sechead { display: flex; align-items: center; justify-content: space-between; margin: 24px 4px 10px; }
.sechead .sec-label { margin: 0; }
.copylink {
  display: inline-flex; align-items: center; gap: 5px;
  border: 0; background: none; cursor: pointer; padding: 4px 2px;
  font-size: 12.5px; color: var(--pine-deep);
}
.copylink:active { opacity: 0.6; }

/* —— 行程卡：左侧日历瓦片 —— */
.staycard {
  display: flex; align-items: center; gap: 13px;
  padding: 14px 14px 14px 12px; margin: 10px 0; cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}
.staycard:hover { border-color: rgba(201, 168, 106, 0.75); }
.staycard:active { transform: scale(0.995); }
.tile {
  flex-shrink: 0; width: 52px; border-radius: 12px; padding: 6px 0 7px;
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  border: 1px solid rgba(169, 133, 61, 0.32); background: rgba(201, 162, 39, 0.09);
}
.tile-m { font-size: 10.5px; font-weight: 600; color: #8a6a2c; letter-spacing: 0.04em; }
.tile-d { font-size: 21px; font-weight: 700; color: var(--pine-deep); line-height: 1.05; }
.sc-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sc-date { font-size: 15px; font-weight: 650; color: var(--ink); }
.meta { display: flex; align-items: center; gap: 7px; margin-top: 4px; flex-wrap: wrap; }
.mtag {
  font-size: 11px; padding: 2px 8px; border-radius: 99px;
  color: var(--pine-deep); background: rgba(28, 90, 74, 0.1); border: 1px solid rgba(28, 90, 74, 0.2);
}
.mtext { font-size: 12px; color: var(--ink-2); }
.miniline { height: 4px; border-radius: 99px; background: rgba(35, 41, 37, 0.08); overflow: hidden; margin-top: 8px; }
.miniline i { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #2c7c66, var(--pine)); transition: width 0.3s; }
.tiny { font-size: 11.5px; color: var(--ink-2); margin-top: 4px; }
.phase {
  font-size: 11px; padding: 2.5px 9px; border-radius: 99px; font-weight: 600;
  color: #8a6a2c; background: rgba(201, 162, 39, 0.14); border: 1px solid rgba(169, 133, 61, 0.3);
}
.chev { color: var(--ink-3); flex-shrink: 0; }

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
