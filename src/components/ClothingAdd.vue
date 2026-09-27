<script setup lang="ts">
import { ref } from 'vue';
import { Plus } from 'lucide-vue-next';

const emit = defineEmits<{ (e: 'add', name: string): void }>();

const TYPES = ['贴身衣物', '短袖', '长袖', '外套', '裤子', '裙子', '睡衣', '泳衣', '运动装备', '鞋'];
const sel = ref(TYPES[0]);

function add() {
  emit('add', sel.value);
}
</script>

<template>
  <div class="clothingadd">
    <select v-model="sel" class="csel" aria-label="选择衣物类型">
      <option v-for="t in TYPES" :key="t" :value="t">{{ t }}</option>
    </select>
    <button class="btn small" @click="add"><Plus :size="14" />添加衣物</button>
  </div>
</template>

<style scoped>
.clothingadd { display: flex; align-items: center; gap: 8px; padding: 9px 0; }
.csel {
  flex: 1; min-height: 36px; padding: 4px 8px; font-size: 13px; color: var(--ink);
  border: 1px solid var(--line); border-radius: 9px; background: #fff;
}
</style>
