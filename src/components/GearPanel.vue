<script setup lang="ts">
import { ref } from 'vue';
import { Trash2 } from 'lucide-vue-next';
import { listGear, saveGear } from '../engine';

const props = defineProps<{ itemId: string }>();
const emit = defineEmits<{ (e: 'change'): void }>();

const brands = ref<string[]>(listGear(props.itemId));
const adding = ref(false);
const newBrand = ref('');

function save() {
  saveGear(props.itemId, [...brands.value]);
  emit('change');
}
function addPick() {
  const brand = newBrand.value.trim();
  if (!brand || brands.value.includes(brand)) { newBrand.value = ''; adding.value = false; return; }
  brands.value.push(brand);
  newBrand.value = '';
  save();
  adding.value = false; // 保存后收起输入框
}
function removePick(i: number) {
  brands.value.splice(i, 1);
  save();
}
</script>

<template>
  <div class="gearpanel">
    <div v-for="(b, i) in brands" :key="b + i" class="gearitem">
      <span class="brand">{{ b }}</span>
      <button class="pickdel" aria-label="删除品牌" @click="removePick(i)"><Trash2 :size="13" /></button>
    </div>
    <div v-if="adding" class="gearadd">
      <input v-model="newBrand" type="text" class="ginput" placeholder="品牌名称，如：安耳悠" @keyup.enter="addPick">
      <button class="btn small" @click="addPick">保存</button>
      <button class="gcancel" @click="adding = false">取消</button>
    </div>
    <div class="gearactions">
      <button v-if="!adding" class="gaction" @click="adding = !adding">{{ adding ? '取消' : '＋ 添加品牌' }}</button>
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
.brand { flex: 1; font-size: 13.5px; font-weight: 650; }
.pickdel { border: 0; background: none; color: var(--ink-3); cursor: pointer; padding: 2px; }
.pickdel:active { color: var(--red); }
.gearadd { display: flex; gap: 6px; margin-top: 7px; }
.ginput { flex: 1; min-width: 0; min-height: 32px; padding: 4px 8px; font-size: 12.5px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
.gcancel { border: 0; background: none; color: var(--ink-2); font-size: 12.5px; cursor: pointer; padding: 2px 4px; }
.gactions { display: flex; align-items: center; gap: 18px; margin-top: 9px; }
.gaction {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  min-height: 28px; padding: 2px 4px;
  border: 0; background: none; color: var(--pine-deep); font-size: 12.5px; cursor: pointer;
}
</style>
