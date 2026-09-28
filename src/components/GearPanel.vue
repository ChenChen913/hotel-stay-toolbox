<script setup lang="ts">
import { computed, ref } from 'vue';
import { Trash2 } from 'lucide-vue-next';
import { addGear, listGear, removeGear } from '../engine';
import type { GearEntry } from '../types';

const props = defineProps<{ name: string; cat: string }>();
const emit = defineEmits<{ (e: 'change'): void }>();

// 只展示「这一件物品」的好物：耳塞行里出现充电宝的品牌没有意义
const rows = ref<{ entry: GearEntry; index: number }[]>(
  listGear(props.cat).map((entry, index) => ({ entry, index })).filter(r => r.entry.name === props.name),
);
const adding = ref(false);
const newBrand = ref('');

/** 新增后按当前物品在完整列表里重新定位下标，避免删除时错位 */
function refresh() {
  rows.value = listGear(props.cat).map((entry, index) => ({ entry, index })).filter(r => r.entry.name === props.name);
  emit('change');
}
function add() {
  const brand = newBrand.value.trim();
  addGear({ name: props.name, brand: brand || undefined, cat: props.cat });
  newBrand.value = '';
  adding.value = false;
  refresh();
}
function remove(index: number) {
  removeGear(index);
  refresh();
}
const label = computed(() => `${props.name} 的好物`);
</script>

<template>
  <div class="gearpanel">
    <p class="gptitle">{{ label }}<span class="gpfoot">个人偏好 · 非商业推荐</span></p>
    <div v-for="r in rows" :key="r.index" class="gearitem">
      <span class="gname">{{ r.entry.name }}</span>
      <span v-if="r.entry.brand" class="gbrand">{{ r.entry.brand }}</span>
      <button class="pickdel" aria-label="删除" @click="remove(r.index)"><Trash2 :size="13" /></button>
    </div>
    <p v-if="!rows.length" class="gpempty">还没记这一件。可以只记品牌，也可以只记「用哪款」。</p>
    <div v-if="adding" class="gearadd">
      <input v-model="newBrand" type="text" class="ginput" placeholder="品牌 · 型号（可留空）" @keyup.enter="add">
      <button class="btn small" @click="add">保存</button>
      <button class="gcancel" @click="adding = false">取消</button>
    </div>
    <div class="gactions">
      <button v-if="!adding" class="gaction" @click="adding = true">＋ 记一个品牌</button>
    </div>
  </div>
</template>

<style scoped>
.gearpanel {
  width: 100%; margin-top: 2px; padding: 10px 12px;
  border-radius: 12px; background: rgba(169, 133, 61, 0.07); border: 1px dashed rgba(169, 133, 61, 0.35);
}
.gptitle { display: flex; align-items: baseline; gap: 8px; margin: 0 0 2px; font-size: 12.5px; font-weight: 650; color: #8a6a2c; }
.gpfoot { margin-left: auto; font-size: 11px; color: var(--ink-3); font-weight: 400; }
.gearitem { display: flex; align-items: baseline; gap: 9px; padding: 5px 0; border-bottom: 1px dashed var(--hairline); }
.gearitem:last-of-type { border-bottom: 0; }
.gname { font-size: 13.5px; font-weight: 650; }
.gbrand { flex: 1; min-width: 0; font-size: 12.5px; color: var(--ink-2); }
.gbrand::before { content: "·"; margin-right: 6px; color: var(--ink-3); }
.pickdel { margin-left: auto; align-self: center; border: 0; background: none; color: var(--ink-3); cursor: pointer; padding: 2px; }
.pickdel:active { color: var(--red); }
.gpempty { margin: 4px 0 2px; font-size: 12px; color: var(--ink-2); }
.gearadd { display: flex; gap: 6px; margin-top: 7px; }
.ginput { flex: 1; min-width: 0; min-height: 32px; padding: 4px 8px; font-size: 12.5px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
.ginput:focus { outline: none; border-color: var(--pine); }
.gcancel { border: 0; background: none; color: var(--ink-2); font-size: 12.5px; cursor: pointer; padding: 2px 4px; }
.gactions { display: flex; align-items: center; gap: 18px; margin-top: 9px; }
.gaction {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  min-height: 28px; padding: 2px 4px;
  border: 0; background: none; color: var(--pine-deep); font-size: 12.5px; cursor: pointer;
}
</style>
