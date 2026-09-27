<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();
</script>

<template>
  <label class="switch">
    <input type="checkbox" :checked="props.modelValue" @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)">
    <span class="knob"></span>
  </label>
</template>
