<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
const pad = (n: number) => String(n).padStart(2, '0');
const toStr = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** 手动解析，避免 new Date('2026-09-03') 被当成 UTC 造成时区偏移 */
function parse(s: string) {
  if (!s) { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; }
  const [y, m] = s.split('-').map(Number);
  return { y, m: m - 1 };
}

const cursor = ref(parse(props.modelValue));
watch(() => props.modelValue, v => { if (v) cursor.value = parse(v); });

const now = new Date();
const todayStr = toStr(now.getFullYear(), now.getMonth(), now.getDate());

const cells = computed(() => {
  const { y, m } = cursor.value;
  const lead = new Date(y, m, 1).getDay();
  const total = new Date(y, m + 1, 0).getDate();
  const out: { key: string; str: string; d: number | null }[] = [];
  for (let i = 0; i < lead; i++) out.push({ key: `p${i}`, str: '', d: null });
  for (let d = 1; d <= total; d++) out.push({ key: `${y}-${m}-${d}`, str: toStr(y, m, d), d });
  while (out.length % 7) out.push({ key: `e${out.length}`, str: '', d: null });
  return out;
});

function shift(n: number) {
  const { y, m } = cursor.value;
  const d = new Date(y, m + n, 1);
  cursor.value = { y: d.getFullYear(), m: d.getMonth() };
}
function pick(str: string) { if (str) emit('update:modelValue', str); }

const isSel = (s: string) => !!s && s === props.modelValue;
const isToday = (s: string) => !!s && s === todayStr;
const isPast = (s: string) => !!s && s < todayStr;
</script>

<template>
  <div class="dpk">
    <div class="dpk-head">
      <button type="button" class="dpk-nav" aria-label="上一月" @click="shift(-1)"><ChevronLeft :size="16" /></button>
      <div class="dpk-title num"><b>{{ cursor.y }}</b> 年 {{ cursor.m + 1 }} 月</div>
      <button type="button" class="dpk-nav" aria-label="下一月" @click="shift(1)"><ChevronRight :size="16" /></button>
    </div>
    <div class="dpk-week">
      <span v-for="w in WEEK" :key="w">{{ w }}</span>
    </div>
    <div class="dpk-grid" role="grid">
      <button v-for="c in cells" :key="c.key" type="button" class="dpk-day num" :class="{ sel: isSel(c.str), today: isToday(c.str), past: isPast(c.str) }" :disabled="!c.str" :aria-pressed="isSel(c.str)" @click="pick(c.str)">
        {{ c.d ?? '' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 限宽：大屏下不撑成一排 80px 的巨格 */
.dpk { padding: 4px 2px 0; max-width: 360px; margin: 0 auto; }
@media (max-width: 400px) { .dpk { padding: 4px 0 0; } }
.dpk-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.dpk-nav {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; flex-shrink: 0;
  border-radius: 10px; cursor: pointer;
  border: 1px solid var(--glass-border); background: rgba(255, 255, 255, 0.6);
  color: var(--pine); transition: background 0.15s, transform 0.12s;
}
.dpk-nav:active { background: rgba(28, 90, 74, 0.14); transform: scale(0.94); }
.dpk-title { font-size: 15px; font-weight: 600; color: var(--pine-deep); letter-spacing: 0.02em; }
.dpk-title b { font-size: 16.5px; font-weight: 700; }
/* 标头与日期格必须同轨：同样的 minmax(0,1fr) + 同样的 gap，否则列宽算出来不同就会错位。
   minmax(0,·) 是必需的：1fr 默认等价 minmax(auto,·)，日期格的 aspect-ratio + min-height 会把
   42px 反向传导成「最小宽度」，窄屏下 7 列撑不下就会整体横向溢出。 */
.dpk-week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 3px; margin-bottom: 4px; }
.dpk-week span { text-align: center; font-size: 11.5px; color: var(--ink-3); padding: 2px 0; }
.dpk-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 3px; }
/* 不要给日期格加 aspect-ratio：一旦配合 min-height，宽高比会把高度反向算成宽度，
   格子就不再 stretch 填满列宽，窄屏下会互相叠出去（错位+溢出的根因）。
   高度给死、宽度交给 grid track，标头与日期格才是同一套坐标。 */
.dpk-day {
  position: relative;
  min-width: 0; min-height: 42px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid transparent; border-radius: 12px; cursor: pointer;
  background: transparent; color: var(--ink);
  font-size: 14.5px; font-weight: 500;
  transition: background 0.14s, color 0.14s, transform 0.12s;
}
.dpk-day:disabled { cursor: default; }
.dpk-day:not(:disabled):active { transform: scale(0.93); }
.dpk-day:not(:disabled):hover { background: rgba(28, 90, 74, 0.09); }
.dpk-day.past { color: var(--ink-3); }
.dpk-day.today { color: var(--pine-deep); font-weight: 700; }
.dpk-day.today::after {
  content: ""; position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%);
  width: 4px; height: 4px; border-radius: 50%; background: var(--gold);
}
.dpk-day.sel {
  background: linear-gradient(160deg, #256c59, var(--pine-deep));
  color: #f4f1e8; font-weight: 650;
  box-shadow: 0 8px 18px -8px rgba(18, 63, 51, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
.dpk-day.sel.today::after { background: #f4f1e8; }
.dpk-day.sel:hover { background: linear-gradient(160deg, #256c59, var(--pine-deep)); }
</style>
