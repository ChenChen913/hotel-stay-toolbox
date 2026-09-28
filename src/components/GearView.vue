<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import { Plus, RotateCcw, Trash2, X } from 'lucide-vue-next';
import { GEAR_CATS, addGear, listGear, removeGear, resetGear } from '../engine';
import type { GearEntry } from '../types';

// 一条 = 物品名称 + 品牌：只写品牌看不出这是什么，所以名称必填、品牌可空
const entries = ref<GearEntry[]>(listGear());

/** 按分类分组，保留原始顺序 */
const groups = computed(() => {
  const byCat = new Map<string, { entry: GearEntry; index: number }[]>();
  entries.value.forEach((entry, index) => {
    const list = byCat.get(entry.cat) ?? [];
    list.push({ entry, index });
    byCat.set(entry.cat, list);
  });
  return GEAR_CATS.filter(c => byCat.has(c)).map(cat => ({ cat, rows: byCat.get(cat)! }));
});
const total = computed(() => entries.value.length);

// —— 添加弹窗：表单只在需要时出现，保存后自动关闭 ——
const open = ref(false);
const newName = ref('');
const newBrand = ref('');
const addCat = ref(GEAR_CATS[0]);
const err = ref('');
const nameInput = ref<HTMLInputElement | null>(null);

function openAdd() {
  newName.value = '';
  newBrand.value = '';
  err.value = '';
  addCat.value = GEAR_CATS[0];
  open.value = true;
  document.addEventListener('keydown', onKey);
  void nextTick(() => nameInput.value?.focus());
}
function closeAdd() {
  open.value = false;
  document.removeEventListener('keydown', onKey);
}
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeAdd(); }
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));

function save() {
  const name = newName.value.trim();
  if (!name) { err.value = '先填物品名称，比如「充电宝」'; return; }
  entries.value = addGear({ name, brand: newBrand.value.trim() || undefined, cat: addCat.value });
  closeAdd();
}
function del(index: number) {
  entries.value = removeGear(index);
}
function restore() {
  if (!confirm('恢复默认好物？你自己添加的会全部清掉。')) return;
  entries.value = resetGear();
}
</script>

<template>
  <header class="gear-head">
    <p class="overline num">My Gear</p>
    <h1 class="display">好物收藏</h1>
    <p class="tagline">记下「哪件东西买了哪个牌子」，下次照着买</p>
  </header>

  <button class="addbtn" @click="openAdd"><Plus :size="16" />添加好物</button>

  <template v-for="g in groups" :key="g.cat">
    <div class="sec-label">{{ g.cat }}</div>
    <div class="glass gcard">
      <div v-for="row in g.rows" :key="row.index" class="gearitem">
        <span class="gname">{{ row.entry.name }}</span>
        <span v-if="row.entry.brand" class="gbrand">{{ row.entry.brand }}</span>
        <button class="pickdel" aria-label="删除" @click="del(row.index)"><Trash2 :size="13" /></button>
      </div>
    </div>
  </template>

  <p v-if="!total" class="muted emptyp">还没有收藏任何好物。点上方「添加好物」，先填物品名称（如「充电宝」），品牌可留空。</p>

  <template v-if="total">
    <p class="gearfoot">共 {{ total }} 件 · ⚪ 个人偏好 · 非商业推荐</p>
    <button class="btn plain" @click="restore"><RotateCcw :size="15" />恢复默认好物</button>
  </template>

  <!-- 添加弹窗：teleport 到 body，避免被 .glass 卡片的层叠上下文困住 -->
  <Teleport to="body">
    <div v-if="open" class="gmask" @click.self="closeAdd">
      <form class="gdialog glass" role="dialog" aria-modal="true" aria-labelledby="gdlg-title" @submit.prevent="save">
        <div class="gdlg-head">
          <h2 id="gdlg-title" class="display">添加好物</h2>
          <button type="button" class="gclose" aria-label="关闭" @click="closeAdd"><X :size="18" /></button>
        </div>
        <p class="gdlg-sub">记下这是什么东西、买的哪个牌子</p>

        <div class="gfield">
          <label for="gdlg-name">物品名称 <span class="req">必填</span></label>
          <input id="gdlg-name" ref="nameInput" v-model="newName" type="text" class="ginput" placeholder="如：充电宝、耳塞、拖鞋" @input="err = ''">
        </div>

        <div class="gfield">
          <label for="gdlg-brand">品牌 · 型号 <span class="opt">选填</span></label>
          <input id="gdlg-brand" v-model="newBrand" type="text" class="ginput" placeholder="如：安耳悠、小米">
        </div>

        <div class="gfield">
          <span class="glabel">分类</span>
          <div class="catchips">
            <button v-for="c in GEAR_CATS" :key="c" type="button" class="catchip" :class="{ on: addCat === c }" @click="addCat = c">{{ c }}</button>
          </div>
        </div>

        <p v-if="err" class="gerr">{{ err }}</p>
        <div class="gdlg-foot">
          <button type="button" class="btn ghost small" @click="closeAdd">取消</button>
          <button type="submit" class="btn small">保存</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.gear-head { margin: 8px 2px 4px; }
.overline { margin: 0; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); font-weight: 600; }
.gear-head h1 { margin: 4px 0 2px; font-size: 27px; font-weight: 650; color: var(--pine-deep); }
.tagline { margin: 0; font-size: 13.5px; color: var(--ink-2); }

.addbtn {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; min-height: 50px; margin: 14px 0 0; border-radius: 15px; cursor: pointer;
  border: 1.5px dashed rgba(169, 133, 61, 0.45);
  background: rgba(169, 133, 61, 0.07); color: #8a6a2c;
  font-size: 15px; font-weight: 650;
  transition: background 0.15s;
}
.addbtn:hover { background: rgba(169, 133, 61, 0.14); }
.addbtn:active { background: rgba(169, 133, 61, 0.2); }

.gcard { padding: 6px 14px; margin: 10px 0; }
.gearitem { display: flex; align-items: baseline; gap: 9px; padding: 9px 0; border-bottom: 1px dashed var(--hairline); }
.gearitem:last-of-type { border-bottom: 0; }
.gname { font-size: 15px; font-weight: 650; color: var(--ink); }
.gbrand { flex: 1; min-width: 0; font-size: 13px; color: var(--ink-2); }
.gbrand::before { content: "·"; margin-right: 6px; color: var(--ink-3); }
.pickdel { margin-left: auto; align-self: center; flex-shrink: 0; border: 0; background: none; color: var(--ink-3); cursor: pointer; padding: 2px; }
.pickdel:active { color: var(--red); }
.emptyp { margin-top: 18px; text-align: center; }
.gearfoot { margin: 14px 4px 0; font-size: 12px; color: var(--ink-3); }

/* —— 添加弹窗：fixed + teleport，z-index 高过底部导航（10）与衣物浮层（1000） —— */
.gmask {
  position: fixed; inset: 0; z-index: 1100;
  display: flex; align-items: center; justify-content: center; padding: 20px;
  background: rgba(28, 45, 38, 0.42);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  animation: gmask-in 0.16s ease-out;
}
@keyframes gmask-in { from { opacity: 0; } to { opacity: 1; } }
.gdialog {
  width: 100%; max-width: 440px; max-height: calc(100dvh - 40px);
  overflow-y: auto; padding: 20px 20px 16px;
  animation: gdialog-in 0.2s cubic-bezier(0.34, 1.3, 0.64, 1);
}
@keyframes gdialog-in { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: none; } }
.gdlg-head { display: flex; align-items: center; gap: 10px; }
.gdlg-head h2 { flex: 1; margin: 0; font-size: 20px; font-weight: 650; color: var(--pine-deep); }
.gclose {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; flex-shrink: 0; border-radius: 11px; cursor: pointer;
  border: 1px solid var(--hairline); background: rgba(35, 41, 37, 0.06); color: var(--ink-2);
}
.gclose:hover { background: rgba(35, 41, 37, 0.12); color: var(--ink); }
.gdlg-sub { margin: 3px 0 14px; font-size: 12.5px; color: var(--ink-2); }
.gfield { margin-bottom: 12px; }
.gfield label, .glabel { display: block; margin-bottom: 5px; font-size: 12.5px; color: var(--ink-2); }
.req { font-size: 11px; color: var(--red); }
.opt { font-size: 11px; color: var(--ink-3); }
.ginput {
  width: 100%; min-height: 46px; padding: 10px 13px; font-size: 15.5px; color: var(--ink);
  border: 1px solid var(--glass-border); border-radius: 13px;
  background: rgba(255, 255, 255, 0.72);
}
.ginput:focus { outline: none; border-color: var(--pine); box-shadow: 0 0 0 3px rgba(28, 90, 74, 0.12); }
.catchips { display: flex; flex-wrap: wrap; gap: 8px; }
.catchip {
  min-height: 36px; padding: 4px 13px; border-radius: 99px; cursor: pointer;
  border: 1.5px solid var(--glass-border); background: rgba(255, 255, 255, 0.6);
  font-size: 13px; color: var(--ink);
}
.catchip.on { border-color: var(--pine); background: rgba(28, 90, 74, 0.1); color: var(--pine-deep); font-weight: 650; }
.gerr { margin: 2px 0 0; font-size: 12.5px; color: var(--red); }
.gdlg-foot { display: flex; gap: 10px; margin-top: 18px; }
.gdlg-foot .btn { flex: 1; }

/* 手机：底部抽屉式，更好按、也不怕键盘顶起来 */
@media (max-width: 560px) {
  .gmask { align-items: flex-end; padding: 0; }
  .gdialog {
    max-width: none; max-height: 88dvh;
    border-radius: 24px 24px 0 0;
    padding: 20px 18px calc(18px + env(safe-area-inset-bottom));
    animation: gsheet-in 0.22s cubic-bezier(0.34, 1.3, 0.64, 1);
  }
}
@keyframes gsheet-in { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
</style>
