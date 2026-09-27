// 应用状态（无路由库，四个视图足够 —— ponytail: 不上 vue-router）
import { ref } from 'vue';
import type { Stage, Stay } from './types';
import { deleteStay as engineDelete, getStay, saveStay } from './engine';

export const view = ref<'home' | 'wizard' | 'stay' | 'know' | 'gear'>('home');
export const stage = ref<Stage>('prep');
export const currentStay = ref<Stay | null>(null);
/** 知识库锚点：指定模块名时，知识库打开后滚动到该模块并展开 */
export const knowModule = ref<string | null>(null);

export function scrollTop() { window.scrollTo({ top: 0 }); }

/** 按日期推断当前阶段（聊02 定稿：系统自动把用户带到当前阶段） */
export function suggestedStage(s: Stay): Stage {
  if (!s.date) return 'prep';
  const [y, m, d] = s.date.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + s.nights - 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (today < start) return 'prep';
  if (today <= end) return 'checkin';
  return 'checkout';
}

/** 首页卡片上的阶段徽标文案（不在期内则不显示） */
export function stayPhaseLabel(s: Stay): string | null {
  if (!s.date) return null;
  const [y, m, d] = s.date.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + s.nights - 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (today < start) return `还有 ${Math.ceil((+start - +today) / 86400000)} 天入住`;
  if (today <= end) return '入住中';
  return null;
}

export function openStay(id: string) {
  currentStay.value = getStay(id);
  stage.value = currentStay.value ? suggestedStage(currentStay.value) : 'prep';
  view.value = 'stay';
  scrollTop();
}
export function goHome() { view.value = 'home'; scrollTop(); }
export function goKnowledge() { knowModule.value = null; view.value = 'know'; scrollTop(); }
export function goWizard() { view.value = 'wizard'; scrollTop(); }
export function goGear() { view.value = 'gear'; scrollTop(); }
/** 打开知识库并定位到指定模块（紧急入口、检查组互链共用） */
export function goKnowledgeModule(module: string) {
  knowModule.value = module;
  view.value = 'know';
  scrollTop();
}
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
