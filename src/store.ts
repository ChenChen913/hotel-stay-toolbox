// 应用状态（无路由库，四个视图足够 —— ponytail: 不上 vue-router）
import { ref } from 'vue';
import type { Stage, Stay } from './types';
import { deleteStay as engineDelete, getStay, saveStay } from './engine';

export const view = ref<'home' | 'wizard' | 'stay' | 'know'>('home');
export const stage = ref<Stage>('prep');
export const currentStay = ref<Stay | null>(null);

export function scrollTop() { window.scrollTo({ top: 0 }); }

export function openStay(id: string) {
  currentStay.value = getStay(id);
  stage.value = 'prep';
  view.value = 'stay';
  scrollTop();
}
export function goHome() { view.value = 'home'; scrollTop(); }
export function goKnowledge() { view.value = 'know'; scrollTop(); }
export function goWizard() { view.value = 'wizard'; scrollTop(); }
export function persist() { if (currentStay.value) saveStay(currentStay.value); }
export function removeCurrentStay() {
  if (currentStay.value) engineDelete(currentStay.value.id);
  currentStay.value = null;
  goHome();
}

/** '2026-10-03' → '10月3日 · 周六'（手动解析避免 UTC 时区偏移） */
export function fmtDate(date: string): string {
  if (!date) return '未填日期';
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${m}月${d}日 · 周${'日一二三四五六'[dt.getDay()]}`;
}
