<script setup lang="ts">
import { computed, ref } from 'vue';
import { Check, ChevronDown, Plus } from 'lucide-vue-next';

const emit = defineEmits<{ (e: 'add', name: string): void }>();

const TYPES = ['贴身衣物', '短袖', '长袖', '外套', '裤子', '裙子', '睡衣', '泳衣', '运动装备', '鞋'];
const open = ref(false);
const customMode = ref(false);
const customName = ref('');
const chosen = ref('');

const label = computed(() => chosen.value || '选择衣物类型…');

function pick(t: string) {
  emit('add', t);
  chosen.value = t;
  open.value = false;
}
function addCustom() {
  const n = customName.value.trim();
  if (!n) return;
  emit('add', n);
  chosen.value = n;
  customName.value = '';
  customMode.value = false;
  open.value = false;
}
function toggle() {
  open.value = !open.value;
  customMode.value = false;
}
</script>

<template>
  <div class="cwrap">
    <button type="button" class="ctrigger" :class="{ on: open }" @click="toggle">
      <span :class="{ ph: !chosen }">{{ label }}</span>
      <ChevronDown :size="14" :class="{ flip: open }" />
    </button>
    <div v-if="open" class="cpanel glass">
      <button type="button" v-for="t in TYPES" :key="t" class="copt" :class="{ chosen: chosen === t }" @click="pick(t)">
        <span>{{ t }}</span>
        <Check v-if="chosen === t" :size="14" class="ck" />
      </button>
      <button type="button" class="copt" :class="{ chosen: customMode }" @click="customMode = !customMode">
        <span>自定义…</span>
      </button>
      <div v-if="customMode" class="crow">
        <input v-model="customName" type="text" class="cinput" placeholder="输入衣物名称，如：防晒衣" @keyup.enter="addCustom">
        <button type="button" class="btn small" @click="addCustom"><Plus :size="13" />添加</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cwrap { position: relative; padding: 9px 0; width: 100%; }
.ctrigger {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  width: 100%; min-height: 42px; padding: 8px 12px;
  border-radius: 11px; cursor: pointer;
  border: 1px solid var(--glass-border); background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  font-size: 13.5px; color: var(--ink);
}
.ctrigger.on { border-color: var(--pine); }
.ctrigger .ph { color: var(--ink-3); }
.ctrigger svg { transition: transform 0.2s; color: var(--pine); }
.ctrigger svg.flip { transform: rotate(180deg); }
.cpanel {
  position: absolute; z-index: 20; left: 0; right: 0; top: calc(100% + 6px);
  border-radius: 13px; padding: 6px;
  background: rgba(255, 253, 249, 0.96);
  backdrop-filter: blur(20px) saturate(1.5); -webkit-backdrop-filter: blur(20px) saturate(1.5);
  border: 1px solid var(--glass-border);
  box-shadow: 0 18px 44px -18px rgba(28, 45, 38, 0.45);
  max-height: 240px; overflow-y: auto;
}
.copt {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; min-height: 38px; padding: 6px 10px;
  border: 0; border-radius: 9px; background: none;
  font-size: 13.5px; color: var(--ink); cursor: pointer; text-align: left;
}
.copt:hover { background: rgba(28, 90, 74, 0.08); }
.copt.chosen { color: var(--pine-deep); font-weight: 650; }
.ck { color: var(--pine); }
.crow { display: flex; gap: 6px; padding: 6px 4px 4px; border-top: 1px dashed var(--hairline); }
.cinput { flex: 1; min-width: 0; min-height: 34px; padding: 4px 9px; font-size: 13px; border: 1px solid var(--line); border-radius: 9px; background: #fff; }
</style>
