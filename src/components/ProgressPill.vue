<script setup lang="ts">
const props = withDefaults(defineProps<{ done: number; total: number; label?: string }>(), { label: '' });
</script>

<template>
  <div class="pill">
    <div class="prog"><i :style="{ width: (props.total ? Math.round(props.done * 100 / props.total) : 0) + '%' }"></i></div>
    <div class="muted text"><b class="num">{{ props.done }}</b> / {{ props.total }} {{ props.label }}</div>
  </div>
</template>

<style scoped>
.pill { margin: 12px 2px 4px; }
.text { margin-top: 7px; }
.text b { font-size: 16px; color: var(--pine-deep); }
</style>
