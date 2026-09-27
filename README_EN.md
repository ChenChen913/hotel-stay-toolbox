<h1 align="center">Hotel Stay Toolbox</h1>

<p align="center">
  <b>English</b> | <a href="./README.md">简体中文</a>
  <br><br>
  <a href="https://github.com/ChenChen913/hotel-toolbox/actions/workflows/deploy.yml"><img src="https://github.com/ChenChen913/hotel-toolbox/actions/workflows/deploy.yml/badge.svg" alt="Deploy"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

Rule-driven hotel stay toolbox: packing list, room & checkout checks, evidence-graded knowledge. No backend.

Use it online: <https://chenchen913.github.io/hotel-toolbox/>

## Table of Contents

- [Why this project](#why-this-project)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Development](#development)
- [FAQ](#faq)
- [Known limitations](#known-limitations)
- [Contributing](#contributing)
- [License](#license)

## Why this project

The project started as a personal note on hotel precautions and was redefined during product design as a toolbox built around a single stay: the core object is not an article but one concrete hotel stay, with lists, checks and knowledge organized around it.

Three design decisions, each archived in the repository:

- Fixed rules instead of AI. Every question must be able to answer "what does this answer change", otherwise it is not asked (see `聊天记录/聊03.txt`)
- The list distinguishes "number of users" from "quantity to prepare"; consumables are calculated as "guests × (nights + 1)" (see `docs/规则表.md`)
- Every knowledge entry carries an evidence level and source; pseudo-detection methods that create false safety are excluded (conclusions come from the three fact-check documents in the repo)

## Getting started

Requirements: Node.js (the repo CI builds and tests on Node 22), npm.

```sh
git clone https://github.com/ChenChen913/hotel-toolbox.git
cd hotel-toolbox
npm install
npm run dev
```

Open <http://localhost:5173/hotel-toolbox/>.

## Usage

The main flow has five steps:

1. Click "创建一次入住" (create a stay) on the home page and answer 5 short questions (dates and nights, guests, companions, purpose, preferences)
2. The app generates a packing list from 27 item rules; quantities are derived from guests and nights, and each item is tagged as "must bring / buy / bring from home"
3. Check items off, adjust quantities, or add custom items (camera, medication, etc.)
4. At the hotel, run the 13-item check-in check (including a 60-second fire check); before leaving, run the 13-item checkout check
5. The knowledge section holds 10 entries with evidence levels and sources, covering fire safety, privacy, hygiene and consumer rights

Stays are stored in the browser. The home page can duplicate the last stay as a template.

## Configuration

| Environment variable | Required | Default | Notes |
|---------------------|----------|---------|-------|
| (none) | — | — | No backend, no external services, no environment variables |

Data is stored in browser `localStorage` (key `htb_stays_v1`) and never uploaded.

## Project structure

```
src/
├── data.ts            # Item rules, fixed checklists, knowledge entries
├── engine.ts          # Rule evaluation and stay storage
├── store.ts           # View state and date formatting
├── components/        # Views and components (home, wizard, stay, knowledge, etc.)
└── styles/global.css  # Design system (glass cards, control styles)
tests/
└── engine.test.ts     # Rule engine tests
docs/
└── 规则表.md           # Rule design document (questionnaire, conditions, quantity formulas)
```

## Development

Stack: Vite, Vue 3, TypeScript, Vitest, icons by lucide-vue-next.

```sh
npm test          # Run tests (9 suites)
npm run build     # Type check + production build
npm run preview   # Preview the production build locally
```

On every push to main, GitHub Actions runs the tests, builds the app and deploys it to GitHub Pages (see `.github/workflows/deploy.yml`).

## FAQ

**Q: Are my stays still there after switching devices or clearing browser data?**
A: No. Stays live only in this browser. The "duplicate last stay" action in the app can rebuild a list quickly.

**Q: Why is something I want to bring not on the list?**
A: The app only recommends items it can infer by rules. Profession- or hobby-related items (camera, medication, pet supplies) go through "add my own must-bring item"; the app shows hints after generating the list.

**Q: Why not use AI to generate the list?**
A: The design settles on fixed rules: they are explainable, testable and work offline. An AI entry point is left for future extensions.

## Known limitations

- Stay data lives in browser localStorage: clearing browser data deletes it, and there is no cross-device sync
- The knowledge section has 10 seed entries; fact-checked material for the full set of 40 is in the repo, backfill pending
- Season is not inferred automatically; users tick "mosquito season" in the questionnaire. Destination weather is not integrated
- Quantity formulas are simplified rules (guests × (nights + 1)); adjust manually in the list

## Contributing

This is a personal project. Questions and suggestions are welcome through [Issues](https://github.com/ChenChen913/hotel-toolbox/issues); please open an Issue before sending a PR.

## License

[MIT](LICENSE) © 2026 ChenChen913
