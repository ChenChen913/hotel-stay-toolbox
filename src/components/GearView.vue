<script setup lang="ts">
import { computed } from 'vue';
import { CAT_ORDER } from '../data';
import { listGear } from '../engine';
import { ITEMS } from '../data';
import GearPanel from './GearPanel.vue';

// 展示所有有好物内容的物品（种子或用户自定义），按目录分组
const groups = computed(() => {
  const withGear = ITEMS.filter(it => listGear(it.id).length > 0);
  const cats = [...new Set(withGear.map(i => i.cat))].sort((a, b) => CAT_ORDER.indexOf(a) - CAT_ORDER.indexOf(b));
  return cats.map(cat => ({ cat, items: withGear.filter(i => i.cat === cat) }));
});
</script>

<template>
  <div v-if="!groups.length" class="glass empty">
    <p>还没有好物收藏</p>
    <p class="muted">在行程清单里点任意物品的「＋ 好物」即可添加</p>
  </div>
  <template v-for="g in groups" :key="g.cat">
    <div class="sec-label">{{ g.cat }}</div>
    <div v-for="it in g.items" :key="it.id" class="glass gcard">
      <div class="gname">{{ it.name }}</div>
      <GearPanel :item-id="it.id" />
    </div>
  </template>
</template>

<style scoped>
.gcard { padding: 12px 16px; margin: 10px 0; }
.gname { font-weight: 650; font-size: 15.5px; margin-bottom: 4px; }
.empty { text-align: center; padding: 30px 20px; margin-top: 14px; }
.empty p { margin: 4px 0; }
</style>
