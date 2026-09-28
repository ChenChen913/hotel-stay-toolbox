<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { Check, ChevronDown, Plus } from 'lucide-vue-next';

const emit = defineEmits<{ (e: 'add', name: string): void }>();

const TYPES = ['贴身衣物', '短袖', '长袖', '外套', '裤子', '裙子', '睡衣', '泳衣', '运动装备', '鞋'];
const open = ref(false);
const customMode = ref(false);
const customName = ref('');
const chosen = ref('');

const triggerEl = ref<HTMLElement | null>(null);
const panelEl = ref<HTMLElement | null>(null);
const box = reactive({ top: 0, left: 0, width: 240, maxH: 280, up: false });

const GAP = 6;          // 触发器与面板间距
const EDGE = 10;        // 视口留白
const NAV_RESERVE = 76; // 底部悬浮导航栏占位

const label = computed(() => chosen.value || '选择衣物类型…');

/** 用 fixed + teleport 定位：脱离 .glass 卡片的层叠上下文，谁也盖不住它 */
function place() {
  const el = triggerEl.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceBelow = vh - r.bottom - GAP - NAV_RESERVE - EDGE;
  const spaceAbove = r.top - GAP - EDGE;
  const up = spaceBelow < 170 && spaceAbove > spaceBelow;

  box.width = Math.min(Math.max(r.width, 220), vw - EDGE * 2);
  box.left = Math.min(Math.max(r.left, EDGE), vw - box.width - EDGE);
  box.maxH = Math.max(120, Math.min(320, up ? spaceAbove : spaceBelow));
  box.up = up;
  box.top = up ? Math.max(EDGE, r.top - GAP - box.maxH) : r.top + r.height + GAP;

  // 二遍测量：拿到真实高度后再精调，避免向上展开时错位
  nextTick(() => {
    const p = panelEl.value;
    if (!p) return;
    const h = p.offsetHeight;
    if (up) box.top = Math.max(EDGE, r.top - GAP - h);
    else if (box.top + h > vh - EDGE) box.top = Math.max(EDGE, vh - EDGE - h);
  });
}

function onDocPointerDown(e: PointerEvent) {
  if (!open.value) return;
  const t = e.target as Node;
  if (triggerEl.value?.contains(t) || panelEl.value?.contains(t)) return;
  close();
}
function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && open.value) close(); }

function toggle() {
  open.value ? close() : show();
}
function show() {
  customMode.value = false;
  open.value = true;
  nextTick(place); // 先让面板挂载，再按真实尺寸定位，避免闪一下错位
  window.addEventListener('scroll', place, true);
  window.addEventListener('resize', place);
  document.addEventListener('pointerdown', onDocPointerDown, true);
  document.addEventListener('keydown', onKey);
}
function close() {
  open.value = false;
  customMode.value = false;
  window.removeEventListener('scroll', place, true);
  window.removeEventListener('resize', place);
  document.removeEventListener('pointerdown', onDocPointerDown, true);
  document.removeEventListener('keydown', onKey);
}
onBeforeUnmount(close);

// 面板里的自定义输入框展开会改变高度，重新贴一次
watch(customMode, () => { if (open.value) place(); });

function pick(t: string) {
  emit('add', t);
  chosen.value = t;
}
function addCustom() {
  const n = customName.value.trim();
  if (!n) return;
  emit('add', n);
  chosen.value = n;
  customName.value = '';
  customMode.value = false;
}
</script>

<template>
  <div class="cwrap">
    <button ref="triggerEl" type="button" class="ctrigger" :class="{ on: open }" :aria-expanded="open" aria-haspopup="listbox" @click="toggle">
      <span :class="{ ph: !chosen }">{{ label }}</span>
      <ChevronDown :size="14" :class="{ flip: open }" />
    </button>

    <Teleport to="body">
      <div v-if="open" ref="panelEl" class="cpanel glass" role="listbox"
           :style="{ top: box.top + 'px', left: box.left + 'px', width: box.width + 'px', maxHeight: box.maxH + 'px', transformOrigin: box.up ? 'bottom center' : 'top center' }">
        <div class="clist">
          <button v-for="t in TYPES" :key="t" type="button" class="copt" :class="{ chosen: chosen === t }" role="option" :aria-selected="chosen === t" @click="pick(t)">
            <span>{{ t }}</span>
            <Check v-if="chosen === t" :size="14" class="ck" />
          </button>
        </div>
        <div class="cfoot">
          <button type="button" class="copt custom" :class="{ chosen: customMode }" @click="customMode = !customMode">
            <span>自定义…</span>
            <Plus :size="13" />
          </button>
          <div v-if="customMode" class="crow">
            <input v-model="customName" type="text" class="cinput" placeholder="输入衣物名称，如：防晒衣" @keyup.enter="addCustom">
            <button type="button" class="btn small" @click="addCustom">添加</button>
          </div>
        </div>
      </div>
    </Teleport>
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
  transition: border-color 0.15s, background 0.15s;
}
.ctrigger.on { border-color: var(--pine); background: rgba(255, 255, 255, 0.9); }
.ctrigger .ph { color: var(--ink-3); }
.ctrigger svg { transition: transform 0.2s; color: var(--pine); flex-shrink: 0; }
.ctrigger svg.flip { transform: rotate(180deg); }

/* fixed + teleport：不受任何祖先的 backdrop-filter / overflow 影响 */
.cpanel {
  position: fixed; z-index: 1000;
  display: flex; flex-direction: column;
  border-radius: 13px; padding: 6px;
  background: rgba(255, 253, 249, 0.97);
  backdrop-filter: blur(20px) saturate(1.5); -webkit-backdrop-filter: blur(20px) saturate(1.5);
  border: 1px solid var(--glass-border);
  box-shadow: 0 20px 48px -18px rgba(28, 45, 38, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  animation: pop 0.14s ease-out;
}
@keyframes pop { from { opacity: 0; transform: scaleY(0.96); } to { opacity: 1; transform: scaleY(1); } }
.clist { overflow-y: auto; -webkit-overflow-scrolling: touch; }
.copt {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  width: 100%; min-height: 38px; padding: 6px 10px;
  border: 0; border-radius: 9px; background: none;
  font-size: 13.5px; color: var(--ink); cursor: pointer; text-align: left;
}
.copt:hover { background: rgba(28, 90, 74, 0.08); }
.copt.chosen { color: var(--pine-deep); font-weight: 650; }
.copt.custom { color: var(--pine); font-weight: 600; }
.ck { color: var(--pine); flex-shrink: 0; }
.cfoot { border-top: 1px dashed var(--hairline); padding-top: 4px; margin-top: 4px; flex-shrink: 0; }
.crow { display: flex; gap: 6px; padding: 4px 2px 2px; }
.cinput {
  flex: 1; min-width: 0; min-height: 34px; padding: 4px 9px;
  font-size: 13px; color: var(--ink);
  border: 1px solid var(--line, rgba(35, 41, 37, 0.15)); border-radius: 9px; background: #fff;
}
.cinput:focus { outline: none; border-color: var(--pine); }
</style>
