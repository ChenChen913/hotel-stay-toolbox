<script setup lang="ts">
import { computed, ref } from 'vue';
import { Plus } from 'lucide-vue-next';

const emit = defineEmits<{ (e: 'add', name: string): void }>();

const PLACEHOLDER = '选择衣物类型…';
const CUSTOM = '自定义…';
const TYPES = ['贴身衣物', '短袖', '长袖', '外套', '裤子', '裙子', '睡衣', '泳衣', '运动装备', '鞋'];
const sel = ref(PLACEHOLDER);
const customName = ref('');

const isCustom = computed(() => sel.value === CUSTOM);
const canAdd = computed(() => (isCustom.value ? customName.value.trim().length > 0 : sel.value !== PLACEHOLDER));

function add() {
  const name = isCustom.value ? customName.value.trim() : sel.value === PLACEHOLDER ? '' : sel.value;
  if (!name) return;
  emit('add', name);
  sel.value = PLACEHOLDER;
  customName.value = '';
}
</script>

<template>
  <div class="clothingadd">
    <select v-model="sel" class="csel" aria-label="选择衣物类型">
      <option :value="PLACEHOLDER" disabled>{{ PLACEHOLDER }}</option>
      <option v-for="t in TYPES" :key="t" :value="t">{{ t }}</option>
      <option :value="CUSTOM">{{ CUSTOM }}</option>
    </select>
    <input v-if="isCustom" v-model="customName" type="text" class="cinput" placeholder="输入衣物名称" @keyup.enter="add">
    <button class="btn small" :disabled="!canAdd" @click="add"><Plus :size="14" />添加衣物</button>
  </div>
</template>

<style scoped>
.clothingadd { display: flex; align-items: center; gap: 8px; padding: 9px 0; flex-wrap: wrap; }
.csel { flex: 1; min-width: 130px; min-height: 38px; font-size: 13px; }
.cinput { flex: 1; min-width: 120px; min-height: 36px; padding: 4px 8px; font-size: 13px; color: var(--ink); border: 1px solid var(--line); border-radius: 9px; background: #fff; }
.btn.small:disabled { opacity: 0.45; cursor: not-allowed; }
</style>
