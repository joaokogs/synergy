<div align="center">
  <img src="./assets/synergy_logo.png" alt="Synergy Logo" width="120" />
  <h1>Synergy</h1>
  <p><strong>Pokémon Team Builder</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.2-000000?logo=next.js&style=flat-square" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&style=flat-square" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&style=flat-square" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&style=flat-square" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Zustand-5-433E38?style=flat-square" alt="Zustand 5" />
  </p>

  <br />

  <p>
    Build competitive Pokémon teams with ease.<br />
    Fine-tune moves, EVs, IVs, natures, abilities, items, and forms —<br />
    then analyze your team's defensive coverage at a glance.
  </p>

  <br />
</div>

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>📋 Team Overview</h3>
      <p>Manage your 6-slot roster. Add, remove, and reorder Pokémon. Your team is saved automatically to <code>localStorage</code>.</p>
    </td>
    <td width="50%">
      <h3>🔧 Full Pokémon Editor</h3>
      <p>Everything you need to craft the perfect set — moves, EVs, IVs, nature, ability, item, Tera type, gender, and forms.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📊 Stats Calculator</h3>
      <p>Real-time Lv. 50 stat computation with nature multipliers, EV thresholds, and IV adjustments.</p>
    </td>
    <td width="50%">
      <h3>🧠 Type Analytics</h3>
      <p>Interactive defensive type chart matrix. See how each team member fares against every attacking type — ability-aware, with weakness/resistance counts.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🌙 Dark Mode</h3>
      <p>System-aware with manual toggle. Theme persisted via <code>localStorage</code>.</p>
    </td>
    <td width="50%">
      <h3>⚡ PokéAPI Powered</h3>
      <p>Live data from PokéAPI with in-memory caching for fast subsequent lookups.</p>
    </td>
  </tr>
</table>

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 📁 Project Structure

```
src/
├── app/                          # App Router pages
│   └── (dashboard)/
│       ├── page.tsx              # Team overview (home)
│       ├── builder/page.tsx      # Pokémon editor
│       ├── analytics/page.tsx    # Type analytics dashboard
│       └── settings/page.tsx     # Settings
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── pokemon/                  # Pokémon display components
│   ├── builder/                  # Builder layout & tabs
│   ├── editor/                   # Per-slot editors
│   └── layout/                   # Sidebar, top bar, grid
├── hooks/
│   └── use-team.ts              # Zustand store hook
├── lib/
│   ├── pokeapi.ts               # PokéAPI client + cache
│   ├── type-chart.ts            # Type effectiveness engine
│   ├── analytics.ts             # Team defensive analysis
│   ├── stat-calculator.ts       # Stat calculation engine
│   └── utils.ts                 # cn() utility
├── stores/
│   └── team-store.ts            # Zustand store (persisted)
└── types/
    └── pokemon.ts               # Shared TypeScript types
```

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org) (App Router) | React framework with SSR/SSR |
| [React 19](https://react.dev) | UI library |
| [TypeScript 5](https://www.typescriptlang.org) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | Accessible component primitives |
| [Zustand 5](https://github.com/pmndrs/zustand) | Client-side state management |
| [PokéAPI](https://pokeapi.co) | Pokémon data source |
| [Lucide](https://lucide.dev) | Icon library |

---

## 🎮 How to Use

1. **Teams** (`/`) — See your 6 slots; click any empty or filled slot to start editing
2. **Builder** (`/builder`) — Full editor with tabs for moves, stats, nature, ability, item, Tera type, gender, and forms
3. **Analytics** (`/analytics`) — View the defensive type chart matrix for your entire team; switch abilities to see how immunity effects change coverage
4. **Settings** (`/settings`) — Rename your team, change format, or reset

---

## 💬 Community

Join the **Synergy** community on Discord to share teams, report bugs, suggest features, or just hang out.

[![Discord](https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white&style=for-the-badge)](https://discord.gg/NaPWwzXg9A)

---

## 📄 License

This project is for educational and non-commercial use. Pokémon is a trademark of The Pokémon Company.
