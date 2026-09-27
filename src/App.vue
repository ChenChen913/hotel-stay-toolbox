<script setup lang="ts">
import { BookOpen, House, Luggage } from 'lucide-vue-next';
import { goGear, goHome, goKnowledge, view } from './store';
import HomeView from './components/HomeView.vue';
import WizardView from './components/WizardView.vue';
import StayView from './components/StayView.vue';
import GearView from './components/GearView.vue';
import KnowledgeView from './components/KnowledgeView.vue';

const VIEWS = { home: HomeView, wizard: WizardView, stay: StayView, know: KnowledgeView, gear: GearView } as const;
</script>

<template>
  <main class="wrap">
    <component :is="VIEWS[view]" :key="view" />
  </main>

  <nav class="navbar glass">
    <button :class="{ on: view === 'home' || view === 'wizard' || view === 'stay' }" data-nav="home" @click="goHome()"><House :size="18" :stroke-width="1.9" />首页</button>
    <button :class="{ on: view === 'gear' }" data-nav="gear" @click="goGear()"><Luggage :size="18" :stroke-width="1.9" />好物</button>
    <button :class="{ on: view === 'know' }" data-nav="know" @click="goKnowledge()"><BookOpen :size="18" :stroke-width="1.9" />知识库</button>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  bottom: calc(12px + env(safe-area-inset-bottom));
  left: 50%; transform: translateX(-50%);
  width: min(420px, calc(100% - 32px));
  display: flex; padding: 5px; z-index: 10;
}
.navbar button {
  flex: 1; min-height: 46px;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  border: 0; border-radius: 15px; background: transparent;
  font-size: 14px; color: var(--ink-2); cursor: pointer; transition: all 0.18s;
}
.navbar button.on {
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.7));
  color: var(--pine-deep); font-weight: 650;
  box-shadow: 0 4px 14px -4px rgba(28, 45, 38, 0.3), inset 0 1px 0 #fff;
}
</style>
