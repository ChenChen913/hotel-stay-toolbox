// 核心类型。存储结构与 V1 完全一致（localStorage key: htb_stays_v1），旧数据可直接读取。
export type ChildAge = '0-3' | '4-6' | '7-12' | '13+';
export type Purpose = '普通短住' | '出差' | '旅游' | '探亲';
export type Stage = 'prep' | 'checkin' | 'checkout';

export interface Prefs {
  sleep: boolean;      // 睡眠敏感
  hygiene: boolean;    // 在意卫生
  mosquito: boolean;   // 蚊虫季节
  gadgets: boolean;    // 电子设备多
}

export interface Conditions {
  date: string;
  nights: number;
  adults: number;
  children: number;
  childAge: ChildAge;
  elderly: boolean;
  pet: boolean;
  purpose: Purpose;
  prefs: Prefs;
}

export type Prep = '必带' | '推荐' | '建议购买' | '家里带' | '可选';
export type Users = 'adult' | 'child' | 'shared';

export interface ItemDef {
  id: string;
  name: string;
  cat: string;
  users: Users;
  prep: Prep;
  unit: string;
  /** 自定义数量函数（消耗品按晚冗余）；缺省 = 按使用人数 */
  qty?: (c: Conditions) => number;
  when: (c: Conditions) => boolean;
}

export interface PrepItem {
  itemId?: string;
  name: string;
  cat: string;
  unit: string;
  prep: string;
  source: '必备' | '推荐' | '自定义';
  users: string;
  qty: number;
  done: boolean;
}

export type RiskLevel = 'high' | 'mid' | 'low';

export interface CheckGroup {
  name: string;
  risk: RiskLevel;
  items: string[];
}

export interface Checklist {
  title: string;
  groups: CheckGroup[];
}

export type Evidence = 'law' | 'official' | 'pro' | 'experience';

export interface KnowledgeEntry {
  id: string;
  module: string;
  title: string;
  evidence: Evidence;
  risk: RiskLevel;
  body: string;
  source: string;
  updated: string;
}

export interface CustomHint {
  icon: string; // lucide 图标名（kebab-case）
  text: string;
}

export interface Stay {
  id: string;
  createdAt: string;
  date: string;
  nights: number;
  conditions: Conditions;
  prep: PrepItem[];
  custom: PrepItem[];
  checkin: boolean[][];
  checkout: boolean[][];
}
