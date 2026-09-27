<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronDown, Trash2 } from 'lucide-vue-next';
import Stepper from './Stepper.vue';
import { GEAR } from '../data';
import { persist } from '../store';
import type { PrepItem } from '../types';

const props = withDefaults(defineProps<{
  item: PrepItem;
  editable?: boolean;       // 显示勾选框（行程内）
  removable?: boolean;      // 显示删除
  assignOptions?: string[]; // 使用人可选项（多人行程时提供）
}>(), { editable: true, removable: false });

const emit = defineEmits<{
  (e: 'toggle', v: boolean): void;
  (e: 'remove'): void;
}>();

const TAG_CLS: Record<string, string> = { '必带': 'need', '建议购买': 'buy', '到店购买': 'shop', '家里带': 'home', '推荐': 'rec', '可选': 'opt', '自定义': 'src' };
const tagCls = computed(() => TAG_CLS[props.item.prep] ?? 'opt');
const gear = computed(() => props.item.itemId ? GEAR.filter(g => g.itemId === props.item.itemId) : []);
const showGear = ref(false);
function onQty(v: number) {
  props.item.qty = v;
  persist();
}
function onAssign(e: Event) {
  props.item.assign = (e.target as HTMLSelectElement).value;
  persist();
}
</script>

<template>
  <div class="row" :class="{ done: props.item.done }">
    <input v-if="props.editable" type="checkbox" class="tick" :checked="props.item.done"
           @change="emit('toggle', ($event.target as HTMLInputElement).checked)">
    <div class="grow">
      <div class="name">{{ props.item.name }}</div>
      <div class="meta">
        <span>{{ props.item.users }}</span>
        <span class="tag" :class="tagCls">{{ props.item.prep }}</span>
        <select v-if="assignOptions && props.editable" class="assign" :value="props.item.assign ?? assignOptions[0]" @change="onAssign">
          <option v-for="o in assignOptions" :key="o" :value="o">{{ o }}</option>
        </select>
        <button v-if="gear.length" class="gearbtn" @click="showGear = !showGear">
          好物<ChevronDown :size="12" :class="{ flip: showGear }" />
        </button>
      </div>
      <div v-if="showGear && gear.length" class="gearbox">
        <div v-for="g in gear" :key="g.name" class="gearitem">
          <b>{{ g.name }}</b><span class="muted">{{ g.note }}</span>
        </div>
        <div class="gearfoot">个人偏好 · 非商业推荐</div>
      </div>
    </div>
    <Stepper :model-value="props.item.qty" :min="1" :unit="props.item.unit" @update:model-value="onQty" />
    <button v-if="props.removable" class="del" aria-label="删除" @click="emit('remove')"><Trash2 :size="16" /></button>
  </div>
</template>

<style scoped>
.del { border: 0; background: none; color: var(--ink-3); padding: 6px 2px; cursor: pointer; }
.del:active { color: var(--red); }
.meta { display: flex; align-items: center; gap: 7px; margin-top: 3px; font-size: 12px; color: var(--ink-2); flex-wrap: wrap; }
.assign {
  min-height: 24px; padding: 1px 4px; font-size: 12px; color: var(--ink-2);
  border: 1px solid var(--hairline); border-radius: 7px; background: rgba(255, 255, 255, 0.55);
}
.gearbtn {
  display: inline-flex; align-items: center; gap: 2px; padding: 2px 8px;
  border-radius: 99px; border: 1px solid rgba(169, 133, 61, 0.3);
  background: rgba(169, 133, 61, 0.1); color: #8a6a2c; font-size: 11.5px; cursor: pointer;
}
.gearbtn svg { transition: transform 0.2s; }
.gearbtn svg.flip { transform: rotate(180deg); }
.gearbox { margin-top: 8px; padding: 9px 11px; border-radius: 11px; background: rgba(169, 133, 61, 0.08); border: 1px dashed rgba(169, 133, 61, 0.35); }
.gearitem { display: flex; flex-direction: column; gap: 1px; padding: 3px 0; font-size: 13px; }
.gearfoot { margin-top: 5px; font-size: 11px; color: var(--ink-3); }
</style>
