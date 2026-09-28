<script setup lang="ts">
import { computed, ref } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import { GEAR_CATS, listGear, saveGear } from '../engine';

// 有品牌收藏的类别才展示；统一「＋ 添加」入口在顶部
const ver = ref(0);
const adding = ref(false);
const addCat = ref(GEAR_CATS[0]);
const newBrand = ref('');

const groups = computed(() => {
  void ver.value;
  return GEAR_CATS.map(cat => ({ cat, brands: listGear(cat) })).filter(g => g.brands.length > 0);
});

function save() {
  const b = newBrand.value.trim();
  if (!b || !addCat.value) return;
  const cur = listGear(addCat.value);
  if (!cur.includes(b)) saveGear(addCat.value, [...cur, b]);
  newBrand.value = '';
  adding.value = false;
  ver.value++;
}
function removeBrand(cat: string, brand: string) {
  saveGear(cat, listGear(cat).filter(x => x !== brand));
  ver.value++;
}
</script>

<template>
  <!-- 统一添加入口：先选类别，再填品牌 -->
  <div class="glass addcard">
    <button v-if="!adding" class="addbtn" @click="adding = true"><Plus :size="15" />添加好物</button>
    <template v-else>
      <p class="flabel">选择类别</p>
      <div class="catchips">
        <button v-for="c in GEAR_CATS" :key="c" type="button" class="catchip" :class="{ on: addCat === c }" @click="addCat = c">{{ c }}</button>
      </div>
      <div class="gearadd">
        <input v-model="newBrand" type="text" class="ginput" placeholder="品牌名称，如：安耳悠" @keyup.enter="save">
        <button type="button" class="btn small" @click="save">保存</button>
        <button type="button" class="gcancel" @click="adding = false">取消</button>
      </div>
    </template>
  </div>

  <template v-for="g in groups" :key="g.cat">
    <div class="sec-label">{{ g.cat }}</div>
    <div class="glass gcard">
      <div v-for="(b, i) in g.brands" :key="b + i" class="gearitem">
        <span class="brand">{{ b }}</span>
        <button class="pickdel" aria-label="删除品牌" @click="removeBrand(g.cat, b)"><Trash2 :size="13" /></button>
      </div>
    </div>
  </template>

  <p v-if="!groups.length" class="muted emptyp">还没有收藏任何品牌。点上方「添加好物」，选一个类别开始。</p>
</template>

<style scoped>
.addcard { padding: 12px 16px; margin-top: 14px; }
.addbtn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; min-height: 46px; border-radius: 12px;
  border: 1.5px dashed rgba(169, 133, 61, 0.45);
  background: rgba(169, 133, 61, 0.07); color: #8a6a2c;
  font-size: 14.5px; font-weight: 650; cursor: pointer;
}
.addbtn:hover { background: rgba(169, 133, 61, 0.14); }
.flabel { font-size: 12.5px; color: var(--ink-2); margin: 4px 0 6px; }
.catchips { display: flex; flex-wrap: wrap; gap: 8px; }
.catchip {
  min-height: 34px; padding: 4px 12px; border-radius: 99px; cursor: pointer;
  border: 1.5px solid var(--glass-border); background: rgba(255, 255, 255, 0.6);
  font-size: 13px; color: var(--ink);
}
.catchip.on { border-color: var(--pine); background: rgba(28, 90, 74, 0.1); color: var(--pine-deep); font-weight: 650; }
.gearadd { display: flex; gap: 6px; margin-top: 8px; }
.ginput { flex: 1; min-width: 0; min-height: 36px; padding: 4px 9px; font-size: 13px; border: 1px solid var(--line); border-radius: 9px; background: #fff; }
.gcancel { border: 0; background: none; color: var(--ink-2); font-size: 12.5px; cursor: pointer; padding: 2px 4px; }
.gcard { padding: 6px 14px; margin: 10px 0; }
.gearitem { display: flex; align-items: center; gap: 6px; padding: 7px 0; border-bottom: 1px dashed var(--hairline); }
.gearitem:last-of-type { border-bottom: 0; }
.brand { flex: 1; font-size: 14px; font-weight: 650; }
.pickdel { border: 0; background: none; color: var(--ink-3); cursor: pointer; padding: 2px; }
.pickdel:active { color: var(--red); }
.emptyp { margin-top: 18px; text-align: center; }
</style>
