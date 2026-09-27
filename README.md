<h1 align="center">酒店入住工具箱</h1>

<p align="center">
  <b>简体中文</b> | <a href="./README_EN.md">English</a>
  <br><br>
  <a href="https://github.com/ChenChen913/hotel-toolbox/actions/workflows/deploy.yml"><img src="https://github.com/ChenChen913/hotel-toolbox/actions/workflows/deploy.yml/badge.svg" alt="Deploy"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

Rule-driven hotel stay toolbox: packing list, room & checkout checks, evidence-graded knowledge. No backend.

中文：规则驱动的酒店入住工具箱——准备清单、入住与退房检查、证据分级知识库。无后端，手机优先。

在线使用：<https://chenchen913.github.io/hotel-toolbox/>

## 目录

- [为什么做这个项目](#为什么做这个项目)
- [快速开始](#快速开始)
- [用法](#用法)
- [配置](#配置)
- [项目结构](#项目结构)
- [开发](#开发)
- [常见问题](#常见问题)
- [已知限制](#已知限制)
- [如何贡献](#如何贡献)
- [许可证](#许可证)

## 为什么做这个项目

这个项目始于一份个人酒店注意事项笔记，在产品定义阶段被重新定义为「以一次入住行程为核心对象的工具箱」：核心对象不是文章，而是一次具体的入住（stay），清单、检查与知识围绕它组织。

三个设计决策，均有存档依据：

- 固定规则驱动，不用 AI。每个问题必须能回答「这个答案会改变什么」，否则不问（见 `聊天记录/聊03.txt`）
- 清单区分「使用人数」与「准备数量」，消耗品按「人数 ×（晚数 + 1）」计算（见 `docs/规则表.md`）
- 知识条目全部标注证据等级与来源，不收录会制造错误安全感的伪检测方法（结论来自仓库内三份事实核查文档）

## 快速开始

前置要求：Node.js（仓库 CI 在 Node 22 下构建与测试）、npm。

```sh
git clone https://github.com/ChenChen913/hotel-toolbox.git
cd hotel-toolbox
npm install
npm run dev
```

打开 <http://localhost:5173/hotel-toolbox/> 即可使用。

## 用法

主流程五步：

1. 首页点「创建一次入住」，回答 5 个小问题（日期与晚数、人数、同行人员、场景、偏好）
2. 系统按规则生成这次入住的准备清单，共 27 条物品规则参与计算，数量自动按人数与晚数折算，并区分「必带 / 建议购买 / 家里带」
3. 勾选备齐情况，可修改数量、删除或添加自定义物品（如相机、常用药品）
4. 到酒店后进入「入住检查」（13 项，含消防 60 秒检查），离开前过「退房检查」（13 项）
5. 「知识库」收录 10 条带证据等级与来源的条目，覆盖消防、隐私、卫生、维权四个方向

行程保存在浏览器本地，首页可「复制上一次入住」作为模板。

## 配置

| 环境变量 | 必填 | 默认值 | 说明 |
|---------|------|--------|------|
| （无） | — | — | 无后端、无外部服务，不需要任何环境变量 |

数据保存在浏览器 `localStorage`（键 `htb_stays_v1`），不上传服务器。

## 项目结构

```
src/
├── data.ts            # 物品规则、固定检查清单、知识条目
├── engine.ts          # 规则求值与行程存取
├── store.ts           # 视图状态与日期格式化
├── components/        # 视图与组件（首页、向导、行程、知识库等）
└── styles/global.css  # 设计系统（玻璃卡片、控件样式）
tests/
└── engine.test.ts     # 规则引擎测试
docs/
└── 规则表.md           # 规则设计文档（问卷、条件、数量公式）
```

## 开发

技术栈：Vite、Vue 3、TypeScript、Vitest，图标用 lucide-vue-next。

```sh
npm test          # 运行测试（9 组断言）
npm run build     # 类型检查 + 产物构建
npm run preview   # 本地预览构建产物
```

推送到 main 后，GitHub Actions 会自动执行测试、构建并部署到 GitHub Pages（配置见 `.github/workflows/deploy.yml`）。

## 常见问题

**Q：换设备或清除浏览器数据后，行程还在吗？**
A：不在。行程只存本机浏览器，换设备前请自行记录；应用内的「复制上一次入住」可以快速重建一份清单。

**Q：为什么清单里没有我想带的东西？**
A：系统只推荐能由规则推断的物品。职业、爱好相关的物品（相机、药品、宠物用品等）走「添加我的必带物品」，应用会在生成清单后给出提示词。

**Q：为什么不用 AI 生成清单？**
A：设计定稿是固定规则驱动：规则可解释、可测试、离线可用。AI 入口留作后续扩展。

## 已知限制

- 行程数据存浏览器 localStorage，清除浏览器数据即丢失，且不跨设备同步
- 知识库目前为 10 条种子条目；全量 40 条的核查素材已在仓库内，待回填
- 季节不自动推断，由用户在问卷中勾选「蚊虫季节」；目的地天气未接入
- 数量公式是简化规则（人数 ×（晚数 + 1）），可在清单中手动调整

## 如何贡献

这是个人项目，欢迎通过 [Issues](https://github.com/ChenChen913/hotel-toolbox/issues) 提出问题与建议；PR 请先开 Issue 讨论。

## 许可证

[MIT](LICENSE) © 2026 ChenChen913
