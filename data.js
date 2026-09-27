// data.js — 物品规则 / 固定清单 / 知识条目。与 docs/规则表.md 同步维护。
// 纯数据 + 纯函数，不依赖 window/document，可在浏览器与 node 中共同加载。

const ITEMS = [
  // —— 基础必备（恒真）——
  { id: 'id_card',   name: '身份证/护照',   cat: '证件', users: 'adult',  prep: '必带',     unit: '份', when: () => true },
  { id: 'phone',     name: '手机/钱包',     cat: '证件', users: 'adult',  prep: '必带',     unit: '份', when: () => true },
  { id: 'charger',   name: '充电器+数据线', cat: '电子', users: 'adult',  prep: '必带',     unit: '套', when: () => true },
  { id: 'powerbank', name: '充电宝',        cat: '电子', users: 'adult',  prep: '推荐',     unit: '个', when: () => true },
  { id: 'toothbrush',name: '牙刷/牙膏',     cat: '洗漱', users: 'adult',  prep: '家里带',   unit: '套', when: () => true },
  { id: 'towel',     name: '毛巾/压缩毛巾', cat: '洗漱', users: 'adult',  prep: '家里带',   unit: '条', when: () => true },
  { id: 'slippers',  name: '拖鞋',          cat: '洗漱', users: 'adult',  prep: '家里带',   unit: '双', when: () => true },
  { id: 'toilet_seat',name: '一次性马桶垫', cat: '卫生', users: 'adult',  prep: '建议购买', unit: '片', qty: c => c.adults * (c.nights + 1), when: () => true },
  { id: 'wet_wipes', name: '湿巾/酒精湿巾', cat: '卫生', users: 'shared', prep: '建议购买', unit: '包', when: () => true },
  { id: 'door_stop', name: '阻门器/顶门器', cat: '安全', users: 'shared', prep: '建议购买', unit: '个', when: () => true },

  // —— 偏好开关触发 ——
  { id: 'sheets',    name: '一次性床单/隔脏睡袋', cat: '卫生', users: 'adult',  prep: '建议购买', unit: '套', qty: c => c.adults * (c.nights + 1), when: c => c.prefs.hygiene },
  { id: 'eye_mask',  name: '眼罩',   cat: '睡眠', users: 'adult',  prep: '家里带', unit: '个', when: c => c.prefs.sleep },
  { id: 'earplugs',  name: '耳塞',   cat: '睡眠', users: 'adult',  prep: '家里带', unit: '副', when: c => c.prefs.sleep },
  { id: 'repellent', name: '驱蚊液/花露水', cat: '驱蚊', users: 'shared', prep: '家里带', unit: '瓶', when: c => c.prefs.mosquito },
  { id: 'gan_charger',name: '氮化镓多口充电器', cat: '电子', users: 'shared', prep: '建议购买', unit: '个', when: c => c.prefs.gadgets },
  { id: 'usb_blocker',name: 'USB 数据阻断器', cat: '电子', users: 'shared', prep: '可选', unit: '个', when: c => c.prefs.gadgets },
  { id: 'power_strip',name: '魔方插座',   cat: '电子', users: 'shared', prep: '可选', unit: '个', when: c => c.prefs.gadgets },

  // —— 老人 ——
  { id: 'anti_slip', name: '防滑拖鞋（酒店拖鞋滑）', cat: '适老', users: 'shared', prep: '家里带',   unit: '双', qty: c => c.elderly ? 1 : 0, when: c => c.elderly },
  { id: 'meds',      name: '常用药品', cat: '健康', users: 'adult',  prep: '必带',     unit: '盒', when: c => c.elderly },
  { id: 'night_light',name: '感应小夜灯', cat: '适老', users: 'shared', prep: '可选',   unit: '个', when: c => c.elderly },

  // —— 儿童（年龄段门控）——
  { id: 'diapers',   name: '纸尿裤', cat: '儿童', users: 'child', prep: '建议购买', unit: '片', qty: c => c.children * (c.nights + 1), when: c => c.children > 0 && c.childAge === '0-3' },
  { id: 'baby_wipes',name: '婴儿湿巾', cat: '儿童', users: 'child', prep: '建议购买', unit: '包', qty: c => c.children, when: c => c.children > 0 && c.childAge === '0-3' },
  { id: 'thermos',   name: '恒温水壶', cat: '儿童', users: 'shared', prep: '家里带',  unit: '个', when: c => c.children > 0 && c.childAge === '0-3' },
  { id: 'bed_rail',  name: '床围挡/枕头阵', cat: '儿童', users: 'shared', prep: '可选', unit: '套', when: c => c.children > 0 && (c.childAge === '0-3' || c.childAge === '4-6') },
  { id: 'kids_set',  name: '儿童牙刷/拖鞋', cat: '儿童', users: 'child', prep: '家里带', unit: '套', qty: c => c.children, when: c => c.children > 0 },

  // —— 长住 ——
  { id: 'laundry',   name: '洗衣片/便携洗衣液', cat: '长住', users: 'shared', prep: '建议购买', unit: '份', when: c => c.nights >= 4 },
  { id: 'drying_rack',name: '折叠晾衣架', cat: '长住', users: 'shared', prep: '家里带',   unit: '个', when: c => c.nights >= 4 },
];

// 默认数量：按使用人数算（每人一份=人数，儿童=儿童数，共用=1）；消耗品等有自定义 qty 函数的按函数
const defaultQty = (item, c) =>
  item.qty ? item.qty(c) : item.users === 'adult' ? c.adults : item.users === 'child' ? c.children : 1;

// —— 固定检查清单（docs/规则表.md §4）——
const CHECKLISTS = {
  checkin: {
    title: '入住检查',
    groups: [
      { name: '消防 60 秒', risk: '🔴', items: [
        '找到最近的两个安全出口',
        '看门后疏散图，数到楼梯的步数',
        '确认疏散通道没有堆物',
        '看一眼灭火器/报警按钮位置',
      ]},
      { name: '房间安全', risk: '🟡', items: [
        '房门反锁，挂上门链',
        '检查窗户能否正常关锁',
        '猫眼/门镜完好',
      ]},
      { name: '卫生快查', risk: '🟢', items: [
        '床品无污渍毛发，掀开看床垫角落有无虫迹',
        '卫生间无霉斑异味',
        '杯具水壶：不放心就换自带，或冲洗后烧开烫一遍',
      ]},
      { name: '隐私辅助观察', risk: '🟡', items: [
        '环视对床、卫生间：有无可疑反光小孔或异常物件',
        '烟感/路由器/机顶盒：有无多余部件或异常移动痕迹',
      ]},
      { name: '收尾', risk: '🟢', items: [
        '贵重物品入保险箱，确认证件钱包位置',
      ]},
    ],
  },
  checkout: {
    title: '退房检查',
    groups: [
      { name: '证件', risk: '🔴', items: ['身份证/护照（床头、抽屉、保险箱都看一眼）'] },
      { name: '电子', risk: '🔴', items: ['手机/电脑/平板', '充电器/数据线/耳机'] },
      { name: '随身', risk: '🟡', items: ['钱包/手表/眼镜', '药品'] },
      { name: '衣物', risk: '🟢', items: ['衣柜、浴室、晾衣位收干净'] },
      { name: '房间四查', risk: '🟡', items: ['床头柜', '卫生间', '衣柜', '插座 + 保险箱'] },
      { name: '收尾', risk: '🟢', items: ['房卡归还', '发票/凭证拿好', '账单核对（有无「一次性用品费」等）'] },
    ],
  },
};

// —— 知识条目（种子 10 条，全部来自三份核查文档的已核实结论）——
// evidence: 🔵官方法规 🟢官方安全建议 🟡专业机构 ⚪个人经验
// risk: 🟢普通注意 🟡建议检查 🔴发现后立即处理
const KNOWLEDGE = [
  { id: 'k1', module: '消防', title: '入住 60 秒消防检查', evidence: '🔵', risk: '🟡',
    body: '进房间先做三件事：看清最近的疏散路径是否畅通、消防设施（灭火器/报警按钮）在哪、房间应急物资是否配齐。看门后疏散图，心里数一遍到楼梯的步数——黑暗中靠它。',
    source: '应急管理部 2026-09-24 发布会三项观察；GB 55037《建筑防火通用规范》', updated: '2026-09' },
  { id: 'k2', module: '消防', title: '火灾发生时的行动原则', evidence: '🟢', risk: '🔴',
    body: '官方用词是「弯腰低姿」，不是匍匐。不要浪费时间去寻找湿毛巾，及时撤离方为上策；不恋财物。「疏散指示图」是推荐性国标和部门规章要求，不是《消防法》直接强制——但正规酒店都应有，缺失可向消防部门反映（96119 多数地区已并入 12345）。',
    source: '应急管理部发布会；GB 55037', updated: '2026-09' },
  { id: 'k3', module: '隐私', title: '偷拍检测：先记住总边界', evidence: '🔵', risk: '🟡',
    body: '所有消费级方法都只能算「辅助观察」，都不能证明房间不存在偷拍设备。宣称「酒店客房几乎每间都有摄像头」属渲染恐慌——公安部已通报不法团伙自导自演炒作偷拍「泛滥」以销售伪劣检测仪（抓获 35 人、扣押 4000 余套，经工信部电子一所/公安部一所鉴定不能有效检测）。',
    source: '公安部通报；工信部电子第一研究所/公安部第一研究所鉴定结论', updated: '2026-09' },
  { id: 'k4', module: '隐私', title: '常见检测方法审查结论表', evidence: '🔵', risk: '🟡',
    body: '① 指尖顶镜面：不靠谱，区分的是镜子前后表面反射，不是普通镜与双面镜（中科院物理所官方定论）。② 关灯手机红外扫描：原理成立但只对带红外补光灯的夜视型摄像头有效，光点微弱难捕捉；苹果客服明确 iPhone 不支持该功能。③ 手电筒找反光：镜头有逆反射（猫眼效应），但必须正对镜头光轴、近距离才有效，只能辅助——「针孔摄像头一定有反光亮点」是错的。④ 手机检测 APP：大量误报、不可复现，有当着民警被推翻的实测。⑤ 市售「防偷拍检测仪」：该品类已被公安部通报存在系统性伪劣问题。',
    source: '中科院物理所；苹果客服；东南大学专家；公安部通报', updated: '2026-09' },
  { id: 'k5', module: '隐私', title: '发现可疑设备怎么办', evidence: '🔵', risk: '🔴',
    body: '不要自行拆除 → 拍照/录像记录 → 离开可疑区域 → 联系酒店/平台 → 必要时报警，并要求出具受案回执（有明确法律依据）。法律上：现行《治安管理处罚法》第七十条新增「非法安装、使用、提供窃听窃照专用器材」；《刑法》第 283、284 条规制非法生产销售与非法使用窃听窃照专用器材罪；酒店依《民法典》第 1198 条承担安全保障义务（补充责任）。《广东省旅馆业治安管理规定》第九条是全国首个明确旅馆防偷拍责任的省级规章。',
    source: '《治安管理处罚法》(2025) 第七十条；《刑法》283/284；《民法典》1198；粤府令', updated: '2026-09' },
  { id: 'k6', module: '卫生', title: '床品与臭虫判据', evidence: '🟢', risk: '🟢',
    body: '掀开床单看床垫边角：血迹、黑色小点（粪便）、浅色虫壳是臭虫的可识别判据；有任一迹象直接要求换房乃至换酒店。床品折痕可作「是否更换」的辅助观察。这是风险判断，不是洁癖——不必对所有床品做深度安检。',
    source: 'CDC 臭虫识别判据', updated: '2026-09' },
  { id: 'k7', module: '卫生', title: '水壶与杯具的正确使用', evidence: '⚪', risk: '🟢',
    body: '「绝对不要用」没有依据，真实风险来自残留物和清洁不到位。合理做法：外观有残留就换；先用清水冲洗，烧一壶倒掉再正式烧；杯具用开水烫洗或自带。「酒店水壶一定被人煮过内裤」属个案恐惧传播，不是普遍事实。',
    source: '个人经验/生活建议（证据等级 ⚪）', updated: '2026-09' },
  { id: 'k8', module: '维权', title: '处理阶梯与投诉热线', evidence: '🔵', risk: '🟢',
    body: '五条法定途径并列（协商/调解/投诉/仲裁/诉讼），不是强制阶梯，但实用顺序是：与酒店协商 → 联系预订平台 → 12315（全国 12315 平台/热线，市场监管）→ 12345（政务便民热线，已承接原 12301 旅游投诉与 12318）→ 消协/仲裁/诉讼。注意：12301 已于 2021 年底取消（办综执发〔2021〕202 号），见到「12301 受理旅游投诉」的说法是过时的，2026 年 4 月仍有主流媒体写错。',
    source: '《消费者权益保护法》；办综执发〔2021〕202 号；全国 12315 平台', updated: '2026-09' },
  { id: 'k9', module: '维权', title: '证据保留与录音录像边界', evidence: '🔵', risk: '🟢',
    body: '有法律意义的材料：订单与支付凭证、与酒店/平台的沟通记录、现场照片视频、账单、发票。自己在房间内录音录像一般合法，但不得侵入他人隐私空间、不得传播他人肖像与隐私（散布可触发《治安管理处罚法》第五十条第（六）项）。「退一赔三、不足 500 按 500」出自《消法》第五十五条，前提是经营者欺诈。',
    source: '《消费者权益保护法》第 55 条；《治安管理处罚法》第 50 条', updated: '2026-09' },
  { id: 'k10', module: '维权', title: '酒店应提供什么：法定 vs 惯例', evidence: '🔵', risk: '🟢',
    body: '法定：实名登记（公安部治安管理）、公共卫生许可与《住宿业卫生规范》（卫监督发〔2007〕221 号——该文件是部门规范性文件，没有 WS/GB 标准编号，见到标注 WS 或 GB 编号的都是错的）。「六小件减量」全国层面只有倡导，强制力来自地方性法规（如上海：「不得主动提供」≠「不得提供」，索要仍应给）。「酒店必须每日打扫」是惯例/约定，不是普遍法定义务。',
    source: '卫监督发〔2007〕221 号；《上海市生活垃圾管理条例》第 22 条', updated: '2026-09' },
];

// 生成清单后的「想想还有什么要带」提示（不替用户判断）
const CUSTOM_HINTS = [
  { icon: '💻', text: '工作：电脑、平板、U 盘、移动硬盘' },
  { icon: '📷', text: '摄影：相机、电池、存储卡' },
  { icon: '💊', text: '个人：常用药品、护理用品' },
  { icon: '👶', text: '儿童：奶粉、辅食、玩具' },
  { icon: '🐶', text: '宠物：粮食、牵引绳（差异大，请自行添加）' },
];
