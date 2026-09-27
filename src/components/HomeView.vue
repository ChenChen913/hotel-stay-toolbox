<script setup lang="ts">
import { computed, ref } from 'vue';
import { Bell, ChevronRight, Copy, Plus } from 'lucide-vue-next';
import { buildPrep, listStays, newStay, saveStay, sortItems } from '../engine';
import type { Stay } from '../types';
import { fmtDate, goWizard, openStay, stayPhaseLabel } from '../store';
import ProgressPill from './ProgressPill.vue';

const stays = ref<Stay[]>([...listStays()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));

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
</script>

<template>
  <section class="hero glass-deep">
    <span class="no num">NO. 01</span>
    <div class="bell"><Bell :size="20" :stroke-width="1.6" /></div>
    <h1 class="display">酒店入住工具箱</h1>
    <p class="tagline">让每一次入住，都少一点遗漏，多一点准备</p>
    <button class="cta" @click="goWizard()">创建一次入住<Plus :size="17" :stroke-width="2.2" /></button>
  </section>

  <button v-if="hasStays" class="btn ghost" @click="copyLast"><Copy :size="16" />复制上一次入住</button>

  <div v-if="!hasStays" class="glass empty">
    <Bell :size="26" :stroke-width="1.4" class="empty-icon" />
    <p>第一次使用：点上方按钮，回答 5 个小问题<br>系统帮你生成这次入住的准备清单（含数量）</p>
    <p class="muted">数据只保存在本机浏览器</p>
  </div>

  <template v-if="hasStays">
    <div class="sec-label">最近的入住</div>
    <article v-for="s in stays" :key="s.id" class="glass staycard" @click="openStay(s.id)">
        <div class="sc-head">
          <div class="grow">
            <div class="sc-date display num">{{ fmtDate(s.date) }} · {{ s.nights }} 晚</div>
            <div class="muted">{{ s.conditions.purpose }}<template v-if="s.conditions.children"> · {{ s.conditions.children }} 个儿童</template><template v-if="s.conditions.elderly"> · 有老人</template></div>
          </div>
          <span v-if="stayPhaseLabel(s)" class="phase">{{ stayPhaseLabel(s) }}</span>
          <ChevronRight :size="18" class="chev" />
        </div>
      <ProgressPill :done="summary(s).done" :total="summary(s).total" label="已备齐" class="sc-prog" />
    </article>
  </template>
</template>

<style scoped>
.hero { position: relative; padding: 30px 26px 26px; margin-top: 8px; overflow: hidden; }
.hero .no { position: absolute; top: 24px; right: 24px; font-size: 12px; letter-spacing: 0.22em; opacity: 0.5; }
.bell {
  display: inline-flex; align-items: center; justify-content: center;
  width: 42px; height: 42px; border-radius: 13px; margin-bottom: 14px;
  border: 1px solid rgba(244, 241, 232, 0.3); color: #e8d9a8;
  background: rgba(244, 241, 232, 0.08);
}
.hero h1 { margin: 0; font-size: 27px; font-weight: 650; }
.tagline { margin: 8px 0 22px; font-size: 13.5px; opacity: 0.82; }
.cta {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; min-height: 50px; border: 0; border-radius: 15px; cursor: pointer;
  background: #f4f1e8; color: var(--pine-deep); font-size: 16px; font-weight: 700;
  box-shadow: 0 10px 24px -12px rgba(0, 0, 0, 0.45);
  transition: transform 0.16s;
}
.cta:active { transform: scale(0.98); }

.empty { text-align: center; padding: 34px 24px; margin-top: 14px; }
.empty-icon { color: var(--gold); margin-bottom: 8px; }
.empty p { margin: 6px 0; font-size: 14px; }

.staycard { padding: 15px 17px; margin: 12px 0; cursor: pointer; transition: border-color 0.15s; }
.staycard:hover { border-color: var(--pine); }
.sc-head { display: flex; align-items: center; gap: 10px; }
.sc-date { font-size: 17px; font-weight: 650; }
.phase { flex-shrink: 0; font-size: 11.5px; padding: 3px 10px; border-radius: 99px; color: var(--pine-deep); background: rgba(28, 90, 74, 0.12); border: 1px solid rgba(28, 90, 74, 0.25); }
.chev { color: var(--ink-3); flex-shrink: 0; }
.sc-prog { margin-top: 10px; }
</style>
