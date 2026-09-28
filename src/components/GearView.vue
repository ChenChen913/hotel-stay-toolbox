<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { Plus, RotateCcw, Trash2 } from 'lucide-vue-next';
import { GEAR_CATS, addGear, listGear, removeGear, resetGear } from '../engine';
import type { GearEntry } from '../types';

// 一条 = 物品名称 + 品牌：只写品牌看不出这是什么，所以名称必填、品牌可空
const entries = ref<GearEntry[]>(listGear());
const adding = ref(false);
const newName = ref('');
const newBrand = ref('');
const addCat = ref(GEAR_CATS[0]);
const nameInput = ref<HTMLInputElement | null>(null);

/** 按分类分组，保留「物品名称 + 品牌」的原始顺序 */
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

function startAdd() {
  adding.value = true;
  void nextTick(() => nameInput.value?.focus());
}
function save() {
  const name = newName.value.trim();
  if (!name || !addCat.value) return;
  entries.value = addGear({ name, brand: newBrand.value.trim() || undefined, cat: addCat.value });
  // 保留分类，方便连续添加同类好物
  newName.value = '';
  newBrand.value = '';
  void nextTick(() => nameInput.value?.focus());
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

  <!-- 添加入口：先填物品名称，再填品牌 -->
  <div class="glass addcard">
    <button v-if="!adding" class="addbtn" @click="startAdd"><Plus :size="15" />添加好物</button>
    <template v-else>
      <p class="flabel">这是什么物品？<span class="req">必填</span></p>
      <input ref="nameInput" v-model="newName" type="text" class="ginput" placeholder="如：充电宝、耳塞、拖鞋" @keyup.enter="save">
      <p class="flabel">品牌 · 型号<span class="opt">选填</span></p>
      <input v-model="newBrand" type="text" class="ginput" placeholder="如：安耳悠、小米" @keyup.enter="save">
      <p class="flabel">分类</p>
      <div class="catchips">
        <button v-for="c in GEAR_CATS" :key="c" type="button" class="catchip" :class="{ on: addCat === c }" @click="addCat = c">{{ c }}</button>
      </div>
      <div class="gearadd">
        <button type="button" class="btn small" @click="save">保存</button>
        <button type="button" class="gcancel" @click="adding = false">取消</button>
      </div>
    </template>
  </div>

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
</template>

<style scoped>
.gear-head { margin: 8px 2px 4px; }
.overline { margin: 0; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); font-weight: 600; }
.gear-head h1 { margin: 4px 0 2px; font-size: 27px; font-weight: 650; color: var(--pine-deep); }
.tagline { margin: 0; font-size: 13.5px; color: var(--ink-2); }

.addcard { padding: 14px 16px; margin-top: 14px; }
.addbtn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; min-height: 46px; border-radius: 12px; cursor: pointer;
  border: 1.5px dashed rgba(169, 133, 61, 0.45);
  background: rgba(169, 133, 61, 0.07); color: #8a6a2c;
  font-size: 14.5px; font-weight: 650;
}
.addbtn:hover { background: rgba(169, 133, 61, 0.14); }
.flabel { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--ink-2); margin: 10px 0 5px; }
.flabel:first-child { margin-top: 0; }
.req { font-size: 11px; color: var(--red); }
.opt { font-size: 11px; color: var(--ink-3); }
.catchips { display: flex; flex-wrap: wrap; gap: 8px; }
.catchip {
  min-height: 34px; padding: 4px 12px; border-radius: 99px; cursor: pointer;
  border: 1.5px solid var(--glass-border); background: rgba(255, 255, 255, 0.6);
  font-size: 13px; color: var(--ink);
}
.catchip.on { border-color: var(--pine); background: rgba(28, 90, 74, 0.1); color: var(--pine-deep); font-weight: 650; }
.gearadd { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
.ginput {
  width: 100%; min-height: 42px; padding: 8px 12px; font-size: 14.5px; color: var(--ink);
  border: 1px solid var(--glass-border); border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
}
.ginput:focus { outline: none; border-color: var(--pine); box-shadow: 0 0 0 3px rgba(28, 90, 74, 0.12); }
.gcancel { border: 0; background: none; color: var(--ink-2); font-size: 13px; cursor: pointer; padding: 6px 4px; }

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
</style>
