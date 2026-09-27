<script setup lang="ts">
import { computed } from 'vue';
import { Trash2 } from 'lucide-vue-next';
import Stepper from './Stepper.vue';
import { persist } from '../store';
import type { PrepItem } from '../types';

const props = withDefaults(defineProps<{
  item: PrepItem;
  editable?: boolean;   // 显示勾选框（行程内）
  removable?: boolean;  // 显示删除
}>(), { editable: true, removable: false });

const emit = defineEmits<{
  (e: 'toggle', v: boolean): void;
  (e: 'remove'): void;
}>();

const TAG_CLS: Record<string, string> = { '必带': 'need', '建议购买': 'buy', '家里带': 'home', '推荐': 'rec', '可选': 'opt', '自定义': 'src' };
const tagCls = computed(() => TAG_CLS[props.item.prep] ?? 'opt');
function onQty(v: number) {
  props.item.qty = v;
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
      </div>
    </div>
    <Stepper :model-value="props.item.qty" :min="1" :unit="props.item.unit" @update:model-value="onQty" />
    <button v-if="props.removable" class="icon-btn" aria-label="删除" @click="emit('remove')"><Trash2 :size="16" /></button>
  </div>
</template>
