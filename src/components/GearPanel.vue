<script setup lang="ts">
import { ref } from 'vue';
import { RotateCcw, Trash2 } from 'lucide-vue-next';
import { gearIsCustomized, listGear, resetGear, saveGear } from '../engine';
import type { GearPick } from '../engine';

const props = defineProps<{ itemId: string }>();
const emit = defineEmits<{ (e: 'change'): void }>();

const gear = ref<GearPick[]>(listGear(props.itemId));
const adding = ref(false);
const newName = ref('');
const newBrand = ref('');

function save() {
  saveGear(props.itemId, JSON.parse(JSON.stringify(gear.value)));
  emit('change');
}
function addPick() {
  const name = newName.value.trim();
  if (!name) return;
  gear.value.push({ name, brand: newBrand.value.trim() || undefined });
  newName.value = ''; newBrand.value = '';
  save();
  adding.value = false; // 保存后收起输入框
}
function removePick(i: number) {
  gear.value.splice(i, 1);
  save();
}
function restore() {
  resetGear(props.itemId);
  gear.value = listGear(props.itemId);
  emit('change');
}
</script>

<template>
  <div class="gearpanel">
    <div v-for="(g, i) in gear" :key="g.name + i" class="gearitem">
      <div class="gearinfo">
        <b>{{ g.name }}</b>
        <span v-if="g.brand" class="gbrand">{{ g.brand }}</span>
      </div>
      <button class="pickdel" aria-label="删除好物" @click="removePick(i)"><Trash2 :size="13" /></button>
    </div>
    <div v-if="adding" class="gearadd">
      <input v-model="newName" type="text" class="ginput" placeholder="名称，如：一次性压缩毛巾">
      <input v-model="newBrand" type="text" class="ginput" placeholder="品牌（可选）" @keyup.enter="addPick">
      <button class="btn small" @click="addPick">保存</button>
    </div>
    <div class="gearactions">
      <button v-if="!adding" class="gaction" @click="adding = true">＋ 添加</button>
      <button v-if="gearIsCustomized(props.itemId)" class="gaction" @click="restore"><RotateCcw :size="12" />恢复默认</button>
      <span class="gearfoot">个人偏好 · 非商业推荐</span>
    </div>
  </div>
</template>

<style scoped>
.gearpanel {
  width: 100%; margin-top: 2px; padding: 10px 12px;
  border-radius: 12px; background: rgba(169, 133, 61, 0.07); border: 1px dashed rgba(169, 133, 61, 0.35);
}
.gearfoot { margin-left: auto; font-size: 11px; color: var(--ink-3); font-weight: 400; }
.gearitem { display: flex; align-items: center; gap: 6px; padding: 5px 0; border-bottom: 1px dashed var(--hairline); }
.gearitem:last-of-type { border-bottom: 0; }
.gearinfo { flex: 1; display: flex; align-items: center; gap: 8px; font-size: 13.5px; }
.gearinfo b { font-weight: 650; }
.gbrand { font-size: 12px; color: var(--ink-2); }
.gbrand::before { content: "品牌 "; color: var(--ink-3); font-size: 11px; }
.pickdel { border: 0; background: none; color: var(--ink-3); cursor: pointer; padding: 2px; }
.pickdel:active { color: var(--red); }
.gearadd { display: flex; gap: 6px; margin-top: 7px; }
.ginput { flex: 1; min-width: 0; min-height: 32px; padding: 4px 8px; font-size: 12.5px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
.gactions { display: flex; align-items: center; gap: 18px; margin-top: 9px; }
.gaction {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  min-height: 28px; padding: 2px 4px;
  border: 0; background: none; color: var(--pine-deep); font-size: 12.5px; cursor: pointer;
}
</style>
