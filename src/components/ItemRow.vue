<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronDown, RotateCcw, Trash2 } from 'lucide-vue-next';
import Stepper from './Stepper.vue';
import { gearIsCustomized, listGear, resetGear, saveGear } from '../engine';
import type { GearPick } from '../engine';
import { persist } from '../store';
import type { PrepItem } from '../types';

const props = withDefaults(defineProps<{
  item: PrepItem;
  editable?: boolean;       // 显示勾选框（行程内）
  removable?: boolean;      // 显示删除
  assignOptions?: string[]; // 使用人可选项（多人行程时提供）
}>(), { editable: true, removable: false });

const emit = defineEmits<{
  (e: 'toggle', v: boolean): void;
  (e: 'remove'): void;
}>();

const TAG_CLS: Record<string, string> = { '必带': 'need', '建议购买': 'buy', '到店购买': 'shop', '家里带': 'home', '推荐': 'rec', '可选': 'opt', '自定义': 'src' };
const tagCls = computed(() => TAG_CLS[props.item.prep] ?? 'opt');

// —— 好物收藏：可查看、可增删、可恢复默认 ——
const gear = ref<GearPick[]>(props.item.itemId ? listGear(props.item.itemId) : []);
const showGear = ref(false);
const adding = ref(false);
const newName = ref('');
const newNote = ref('');

function save() {
  if (props.item.itemId) saveGear(props.item.itemId, JSON.parse(JSON.stringify(gear.value)));
}
function addPick() {
  const name = newName.value.trim();
  if (!name) return;
  gear.value.push({ name, note: newNote.value.trim(), custom: true });
  newName.value = ''; newNote.value = '';
  save();
}
function removePick(i: number) {
  gear.value.splice(i, 1);
  save();
}
function restore() {
  if (props.item.itemId) resetGear(props.item.itemId);
  gear.value = props.item.itemId ? listGear(props.item.itemId) : [];
}
function onQty(v: number) {
  props.item.qty = v;
  persist();
}
function onAssign(e: Event) {
  props.item.assign = (e.target as HTMLSelectElement).value;
  persist();
}
</script>

<template>
  <div class="row" :class="{ done: props.item.done }">
    <input v-if="props.editable" type="checkbox" class="tick" :checked="props.item.done"
           @change="emit('toggle', ($event.target as HTMLInputElement).checked)">
    <div class="grow">
      <div class="name">{{ props.item.name }}</div>
      <div class="meta">
        <span>{{ props.item.users }}</span>
        <span class="tag" :class="tagCls">{{ props.item.prep }}</span>
        <select v-if="assignOptions && props.editable" class="assign" :value="props.item.assign ?? assignOptions[0]" @change="onAssign">
          <option v-for="o in assignOptions" :key="o" :value="o">{{ o }}</option>
        </select>
        <button v-if="gear.length || adding" class="gearbtn" :class="{ open: showGear }" @click="showGear = !showGear">
          好物 {{ gear.length || '' }}<ChevronDown :size="12" :class="{ flip: showGear }" />
        </button>
        <button v-if="!gear.length && !adding" class="gearbtn add" @click="adding = true; showGear = true">＋ 好物</button>
      </div>
    </div>
    <Stepper :model-value="props.item.qty" :min="1" :unit="props.item.unit" @update:model-value="onQty" />
    <button v-if="props.removable" class="del" aria-label="删除" @click="emit('remove')"><Trash2 :size="16" /></button>

    <div v-if="showGear" class="gearpanel">
      <div class="gearhead">好物收藏<span class="gearfoot">个人偏好 · 非商业推荐</span></div>
      <div v-for="(g, i) in gear" :key="g.name + i" class="gearitem">
        <div class="gearinfo"><b>{{ g.name }}</b><span class="muted">{{ g.note }}</span></div>
        <button class="pickdel" aria-label="删除好物" @click="removePick(i)"><Trash2 :size="13" /></button>
      </div>
      <div v-if="adding" class="gearadd">
        <input v-model="newName" type="text" class="ginput" placeholder="名称，如：一次性压缩毛巾">
        <input v-model="newNote" type="text" class="ginput" placeholder="备注（可选）" @keyup.enter="addPick">
        <button class="btn small" @click="addPick">保存</button>
      </div>
      <div class="gearactions">
        <button v-if="!adding" class="gaction" @click="adding = true">＋ 添加</button>
        <button v-if="props.item.itemId && gearIsCustomized(props.item.itemId)" class="gaction" @click="restore"><RotateCcw :size="12" />恢复默认</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.del { border: 0; background: none; color: var(--ink-3); padding: 6px 2px; cursor: pointer; }
.del:active { color: var(--red); }
.meta { display: flex; align-items: center; gap: 7px; margin-top: 3px; font-size: 12px; color: var(--ink-2); flex-wrap: wrap; }
.assign {
  min-height: 24px; padding: 1px 4px; font-size: 12px; color: var(--ink-2);
  border: 1px solid var(--hairline); border-radius: 7px; background: rgba(255, 255, 255, 0.55);
}
.gearbtn {
  display: inline-flex; align-items: center; gap: 3px; padding: 2.5px 9px;
  border-radius: 99px; border: 1px solid rgba(169, 133, 61, 0.3);
  background: rgba(169, 133, 61, 0.1); color: #8a6a2c; font-size: 11.5px; cursor: pointer;
}
.gearbtn.add { background: transparent; border-style: dashed; color: var(--ink-3); }
.gearbtn.open { background: rgba(169, 133, 61, 0.18); }
.gearbtn svg { transition: transform 0.2s; }
.gearbtn svg.flip { transform: rotate(180deg); }
.row:has(.gearpanel) { flex-wrap: wrap; }
.gearpanel {
  width: 100%; margin-top: 2px; padding: 10px 12px;
  border-radius: 12px; background: rgba(169, 133, 61, 0.07); border: 1px dashed rgba(169, 133, 61, 0.35);
}
.gearhead { display: flex; align-items: baseline; justify-content: space-between; font-weight: 650; font-size: 13.5px; margin-bottom: 4px; }
.gearfoot { font-size: 11px; color: var(--ink-3); font-weight: 400; }
.gearitem { display: flex; align-items: flex-start; gap: 6px; padding: 5px 0; border-bottom: 1px dashed var(--hairline); }
.gearitem:last-of-type { border-bottom: 0; }
.gearinfo { flex: 1; display: flex; flex-direction: column; gap: 1px; font-size: 13.5px; }
.gearinfo .muted { font-size: 12px; }
.pickdel { border: 0; background: none; color: var(--ink-3); cursor: pointer; padding: 2px; }
.pickdel:active { color: var(--red); }
.gearadd { display: flex; gap: 6px; margin-top: 7px; }
.ginput { flex: 1; min-width: 0; min-height: 32px; padding: 4px 8px; font-size: 12.5px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
.gactions { display: flex; gap: 10px; margin-top: 7px; }
.gaction {
  display: inline-flex; align-items: center; gap: 4px;
  border: 0; background: none; color: var(--pine-deep); font-size: 12.5px; cursor: pointer; padding: 2px 0;
}
</style>
