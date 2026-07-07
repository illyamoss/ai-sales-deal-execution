<div align="center">
  <img src="public/icons.svg" alt="AI Sales Deal Execution" width="80" />

  # AI Sales Deal Execution

  **Generate hyper-personalized business proposals with AI — in seconds.**

  Research your client. Draft the proposal. Track engagement. Close the deal.

  <img src="https://img.shields.io/badge/react-19-blue?logo=react" />
  <img src="https://img.shields.io/badge/typescript-6-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/express-5-black?logo=express" />
  <img src="https://img.shields.io/badge/vite-8-purple?logo=vite" />
</div>

---

## How It Works

1. **Describe your company** — AI needs to know what you do, your methodology, and your value prop.
2. **Add a client** — name, website, and any context about their needs.
3. **AI does the research** — it analyzes your company profile against the client's industry and requirements.
4. **Proposal streams in live** — sections appear one by one as the AI writes them, with real-time progress.
5. **Edit with chat** — open the AI sidebar and tell it what to change. It rewrites sections on the fly.
6. **Share & track** — send a client-facing link. See exactly which sections they read, for how long, and whether they scrolled deep enough.

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **Hermes Gateway** running locally (see [Hermes Setup](#hermes-gateway-setup))

### 1. Install & Run

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Start the API server (port 3000)
cd server && npm start &

# Start the frontend (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 2. Set your company description

Click the **⚙ gear** icon in the top bar and paste your company description. This is what the AI uses to understand your business and write relevant proposals.

### 3. Create your first proposal

Click **+ New** → fill in the client's name, website, and any details. The AI will:
- Deeply research the fit between your company and the client
- Choose the best sections for this specific deal
- Stream each section in real-time

---

## Hermes Gateway Setup

The AI is powered by a local [Hermes LLM gateway](https://github.com/NousResearch/Hermes-Function-Calling). 

### Configure Hermes

Add the following to `~/.hermes/.env`:

```env
API_SERVER_ENABLED=true
API_SERVER_KEY=strong
API_SERVER_PORT=8642
API_SERVER_CORS_ORIGINS=http://localhost:5173
```

Then start the Hermes gateway:

```bash
hermes-gateway
```

### Configure the API Key

The app reads the Hermes API key from the `API_SERVER_KEY` environment variable. By default it uses `"strong"` — matching the value above.

To use a custom key:

```bash
API_SERVER_KEY=my-custom-key cd server && npm start
```

---

## Architecture

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React + Vite      │────▶│  Express Server   │────▶│  Hermes Gateway │
│   (port 5173)       │◀────│  (port 3000)      │◀────│  (port 8642)    │
│                     │     │                    │     │                 │
│  • Proposal editor  │     │  • SSE streaming   │     │  • LLM inference│
│  • AI chat sidebar  │     │  • SQLite storage  │     │  • Streaming    │
│  • Analytics dash   │     │  • REST API        │     │                 │
│  • Client view      │     │  • Tab management  │     │                 │
└─────────────────────┘     └──────────────────┘     └─────────────────┘
```

### Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, TypeScript, Vite | Proposal editor, AI chat, analytics |
| Backend | Express 5, TypeScript | SSE streaming, SQLite CRUD |
| AI | Hermes Gateway (local LLM) | Proposal generation, chat editing |
| Storage | SQLite | Proposals, tabs, analytics events |
| Styling | Inline CSS + CSS variables | Dark theme, animations |
| Charts | Recharts | Analytics dashboard |

### API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/settings` | Get company description |
| `POST` | `/api/settings` | Save company description |
| `POST` | `/api/proposals` | Create proposal + client + page |
| `GET` | `/api/proposals` | List all proposals |
| `GET` | `/api/proposals/:id` | Get proposal with tabs |
| `POST` | `/api/proposals/:id/generate` | SSE-stream AI generation |
| `POST` | `/api/proposals/:id/chat` | AI chat edit a tab |
| `PUT` | `/api/tabs/:id` | Update tab content |
| `DELETE` | `/api/proposals/:id` | Delete proposal cascade |
| `POST` | `/api/analytics` | Batch-save analytics |
| `GET` | `/api/analytics/:proposalId` | Get analytics events |

### Database Schema

```
clients            proposals          proposal_pages     proposal_tabs
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ id (PK)      │   │ id (PK)      │◀──│ proposalId   │   │ id (PK)      │
│ name         │──▶│ clientId (FK)│   │ id (PK)      │◀──│ proposalPageId│
│ website      │   │ createdAt    │   └──────────────┘   │ title        │
│ details      │   └──────────────┘                      │ htmlContent  │
└──────────────┘                                         └──────────────┘

company_settings     analytics_events
┌──────────────┐   ┌──────────────────┐
│ id (PK)      │   │ id (PK)          │
│ description  │   │ proposalId (FK)  │
└──────────────┘   │ tabId            │
                   │ eventType        │
                   │ value            │
                   │ sessionId        │
                   │ metadata (JSON)  │
                   │ timestamp        │
                   └──────────────────┘
```

---

## Features

### AI Proposal Generation
- **Deep client research** — AI analyzes the client's industry, website, and context
- **Dynamic section selection** — chooses the right sections based on client type (startup, enterprise, technical, etc.)
- **Real-time streaming** — sections appear as they're written via Server-Sent Events
- **Deduplication guard** — ensures no duplicate sections even during token-by-token streaming

### AI Chat Editor
- **Natural language editing** — "make it more confident", "add a pricing table", "shorten this section"
- **Preview before save** — see AI changes in a preview pane with save/discard controls
- **Context-aware** — the AI knows your company profile, the client, and the current section

### Analytics
- **Engagement scoring** — weighted composite (time 40%, coverage 25%, sessions 15%, scroll 10%, clicks 10%)
- **Reading path** — visual breadcrumb of which tabs the client navigated through
- **Deal signals** — "Client returned 3 times", "Deep reading on pricing detected"
- **Time-per-section charts** — bar charts showing where the client spent the most time
- **Batch event tracking** — analytics buffered client-side, sent on tab switch and page unload

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_SERVER_KEY` | `strong` | Authentication key for Hermes Gateway |

---

## Development

```bash
# Frontend
npm run dev       # Start Vite dev server (port 5173)
npm run build     # TypeScript + Vite production build
npm run lint      # Oxlint
npm run preview   # Preview production build

# Backend
cd server
npm start         # Start Express + SQLite (port 3000)
npx tsc --noEmit  # TypeCheck server
```

---

## License

MIT
