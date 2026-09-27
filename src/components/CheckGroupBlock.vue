<script setup lang="ts">
const props = defineProps<{ items: string[]; states: boolean[] }>();
const emit = defineEmits<{ (e: 'set', ii: number, v: boolean): void }>();
</script>

<template>
  <div v-for="(t, ii) in props.items" :key="t" class="row" :class="{ done: props.states[ii] }">
    <input type="checkbox" class="tick" :checked="props.states[ii]" @change="emit('set', ii, ($event.target as HTMLInputElement).checked)">
    <div class="grow name">{{ t }}</div>
  </div>
</template>
