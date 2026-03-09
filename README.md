# Cadre

A daily workspace where humans and AI agents collaborate on tasks. Built with Next.js, Supabase, and the Anthropic SDK.

## Features

- **12 AI Agents** — Scout, Quill, Metric, Atlas, Voyager, Pulse, Sleuth, Caster, Architect, Catalyst, Vitalis, Strategist
- **Smart Agent Suggestions** — as you type a task, Cadre recommends the best agents based on keywords
- **Multi-Agent Pipelines** — select multiple agents and drag-and-drop to reorder their execution sequence
- **Task Priority System** — Urgent, High, Normal, Low with color-coded badges
- **Command Palette (⌘K)** — search tasks, agents, and navigate instantly
- **Analytics Dashboard** — status distribution, agent performance, priority breakdown, token usage
- **Bulk Operations** — select multiple tasks to delete, change priority, or move sections
- **Canva-Inspired Design** — soft pastel agent cards, spring animations, drag-and-drop everywhere
- **Custom Agent Creation** — build your own agents with custom icons, colors, models, and system prompts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Frontend | React 19, Tailwind CSS 4, shadcn/ui |
| Backend | Supabase (Postgres + RLS + Realtime) |
| AI | Anthropic SDK (Claude Sonnet 4 / Haiku 4.5) |
| Data Fetching | SWR |
| Validation | Zod |

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/jainaarushi/missioncontroller.git
cd missioncontroller
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your API keys:

- **Supabase**: Create a project at [supabase.com](https://supabase.com), then go to Settings > API
- **Anthropic**: Get an API key at [console.anthropic.com](https://console.anthropic.com)

> **Demo mode**: The app works without API keys using in-memory mock data. Add real keys to enable persistent storage and real AI execution.

### 4. Set up the database (optional)

If using Supabase, run the schema in the SQL Editor:

```bash
# Copy contents of supabase-schema.sql into Supabase SQL Editor and run
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Main app pages (today, agents, analytics, completed, settings)
│   ├── api/                # API routes (tasks, agents, stats)
│   └── login/              # Auth page
├── components/
│   ├── agents/             # Agent cards, creation modal, avatar
│   ├── layout/             # Sidebar, navigation, footer
│   ├── shared/             # Command palette, confetti, progress arc
│   ├── tasks/              # Task cards, sections, bulk actions, create modal
│   └── ui/                 # shadcn components
├── lib/
│   ├── ai/                 # Anthropic client, cost calculator
│   ├── hooks/              # SWR data hooks
│   ├── supabase/           # Client, server, admin SDK setup
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Constants, agent suggestion engine
│   └── validators/         # Zod schemas
└── seed/                   # 12 preset agent definitions
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘N | Create a new task |
| ⌘K | Open command palette |

## Modes

| Mode | When | What works |
|------|------|-----------|
| **Demo** | No API keys | Mock data, simulated agent execution, all UI features |
| **Live** | Real API keys | Persistent database, real Claude AI execution, auth |

## License

MIT
