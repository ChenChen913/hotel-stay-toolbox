<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronDown, Trash2 } from 'lucide-vue-next';
import Stepper from './Stepper.vue';
import GearPanel from './GearPanel.vue';
import { listGear } from '../engine';
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

// —— 好物收藏入口（编辑面板在 GearPanel）——
const showGear = ref(false);
const gearCount = ref(listGear(props.item.cat).length);
function onGearChange() {
  gearCount.value = listGear(props.item.cat).length;
}
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
  <div class="row" :class="{ done: props.item.done, zero: props.item.qty === 0 }">
    <input v-if="props.editable" type="checkbox" class="tick" :checked="props.item.done"
           :disabled="props.item.qty === 0"
           @change="emit('toggle', ($event.target as HTMLInputElement).checked)">
    <div class="grow">
      <div class="name">{{ props.item.name }}</div>
      <div class="meta">
        <span>{{ props.item.users }}</span>
        <span v-if="props.item.qty === 0" class="tag zero">不带</span>
        <span v-else class="tag" :class="tagCls">{{ props.item.prep }}</span>
        <select v-if="assignOptions && props.editable" class="assign" :value="props.item.assign ?? assignOptions[0]" @change="onAssign">
          <option v-for="o in assignOptions" :key="o" :value="o">{{ o }}</option>
        </select>
        <button v-if="props.item.itemId" class="gearbtn" :class="{ open: showGear }" @click="showGear = !showGear">
          {{ gearCount ? `好物 ${gearCount}` : '＋ 好物' }}<ChevronDown v-if="gearCount" :size="12" :class="{ flip: showGear }" />
        </button>
      </div>
    </div>
    <Stepper :model-value="props.item.qty" :min="0" :unit="props.item.unit" @update:model-value="onQty" />
    <button v-if="props.removable" class="del" aria-label="删除" @click="emit('remove')"><Trash2 :size="16" /></button>

    <GearPanel v-if="showGear" :cat="props.item.cat" @change="onGearChange" />
  </div>
</template>

<style scoped>
.row.zero .name { opacity: 0.5; }
.tick:disabled { opacity: 0.35; cursor: not-allowed; }
.del { border: 0; background: none; color: var(--ink-3); padding: 6px 2px; cursor: pointer; }
.del:active { color: var(--red); }
.meta { display: flex; align-items: center; gap: 7px; margin-top: 3px; font-size: 12px; color: var(--ink-2); flex-wrap: wrap; }
.assign { min-height: 26px; padding: 1px 20px 1px 6px; font-size: 12px; color: var(--ink-2); border-radius: 7px; }
.gearbtn {
  display: inline-flex; align-items: center; gap: 3px; padding: 2.5px 9px;
  border-radius: 99px; border: 1px solid rgba(169, 133, 61, 0.3);
  background: rgba(169, 133, 61, 0.1); color: #8a6a2c; font-size: 11.5px; cursor: pointer;
}
.gearbtn.open { background: rgba(169, 133, 61, 0.18); }
.gearbtn svg { transition: transform 0.2s; }
.gearbtn svg.flip { transform: rotate(180deg); }
.row:has(.gearpanel) { flex-wrap: wrap; }
</style>
