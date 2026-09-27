<script setup lang="ts">
import { Minus, Plus } from 'lucide-vue-next';

const props = withDefaults(defineProps<{ modelValue: number; min?: number; max?: number; unit?: string }>(), {
  min: 1, max: 99, unit: '',
});
const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>();

function step(d: number) {
  emit('update:modelValue', Math.max(props.min, Math.min(props.max, props.modelValue + d)));
}
</script>

<template>
  <div class="stepper">
    <button class="st" :disabled="modelValue <= min" aria-label="减少" @click="step(-1)"><Minus :size="15" :stroke-width="2.2" /></button>
    <b class="num val">{{ modelValue }}</b>
    <button class="st" :disabled="modelValue >= max" aria-label="增加" @click="step(1)"><Plus :size="15" :stroke-width="2.2" /></button>
    <span v-if="unit" class="unit">{{ unit }}</span>
  </div>
</template>

<style scoped>
.stepper { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
.st {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
  border: 1px solid var(--glass-border); color: var(--pine-deep);
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.5));
  box-shadow: 0 2px 8px -2px rgba(28, 45, 38, 0.2), inset 0 1px 0 #fff;
  transition: transform 0.15s, box-shadow 0.15s;
}
.st:active { transform: scale(0.92); }
.st:disabled { opacity: 0.35; }
.val { min-width: 30px; text-align: center; font-size: 16.5px; font-weight: 650; }
.unit { font-size: 12px; color: var(--ink-2); }
</style>
