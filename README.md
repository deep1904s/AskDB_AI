# 🚀 AskDB — AI-Powered Database Assistant

<div align="center">

**Query your databases using plain English. Upload a CSV, ask questions, get instant SQL + results.**

`React` · `FastAPI` · `PostgreSQL` · `Redis` · `Local AI Inference` · `Docker`

</div>

---

## 📌 Overview

AskDB is a production-ready, full-stack AI system that lets users interact with structured data using natural language. It translates English questions into SQL queries, executes them against a PostgreSQL database, and returns results with detailed AI-generated explanations.

The system features a **ChatBot-style interface** with a dark neon theme, persistent chat history, intelligent intent classification, and a complete Docker deployment setup.

---

## ✨ Key Features

### 🤖 Intelligent Chat System
- **Intent Classification** — Automatically detects if a message is a general question, data query, or follow-up analytics request
- **General Chat** — Responds conversationally to greetings, help requests, and general questions using the LLM
- **SQL Generation** — Converts natural language to PostgreSQL-compatible SQL queries
- **Follow-up Analytics** — Analyzes previous query results when asked (e.g., "summarize the above results")
- **Result Explanations** — Auto-generates detailed analytical explanations alongside query results

### 🗄️ Dynamic Data Pipeline
- **CSV Upload** — Drag-and-drop CSV upload, auto-ingested into PostgreSQL
- **Dynamic Table Routing** — Always queries the most recently uploaded dataset (no hardcoded table names)
- **Schema-Aware Prompting** — Extracts column names and types, sends to LLM for accurate SQL generation
- **Context Tracking** — Stores last query results for intelligent follow-up conversations

### 🛡️ Safety & Performance
- **SQL Validation** — Blocks dangerous operations (DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE)
- **Redis Caching** — Caches generated SQL queries with table-scoped keys (5-min TTL)
- **Cache Invalidation** — Auto-clears cache on new dataset uploads
- **Rate Limiting** — 5 requests/minute per client via SlowAPI
- **Schema Enforcement** — Validates SQL columns against actual database schema

### 🎨 Premium UI (ChatGPT-Style)
- **Dark Theme** — Clean dark theme with accent highlights
- **Collapsible Sidebar** — Conversation history, dataset upload, branding
- **Chat Bubbles** — User/AI avatars, timestamps, fade-in animations
- **Typing Indicator** — Animated neon dots while AI processes
- **Welcome Screen** — Feature cards and suggested query examples
- **Inline Results** — SQL code blocks (with copy), styled data tables (with CSV download)
- **Auto-expanding Input** — Textarea with keyboard shortcut hints
---

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│        ChatGPT-style UI · Dark Neon Theme            │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────┐
│               FastAPI Backend                        │
│  ┌────────────┐ ┌──────────┐ ┌───────────────────┐  │
│  │Rate Limiter│ │  Router  │ │ Intent Classifier │  │
│  └────────────┘ └────┬─────┘ └─────────┬─────────┘  │
│                      │                 │             │
│         ┌────────────┼─────────────────┤             │
│         ▼            ▼                 ▼             │
│  ┌──────────┐ ┌──────────┐   ┌──────────────────┐   │
│  │  Redis   │ │   SQL    │   │  Chat / Analytics │   │
│  │  Cache   │ │Generator │   │    Service        │   │
│  └──────────┘ └────┬─────┘   └──────────────────┘   │
│                    │                                 │
│              ┌─────▼──────┐                          │
│              │ SQL Safety │                          │
│              │ Validator  │                          │
│              └─────┬──────┘                          │
│                    │                                 │
│              ┌─────▼──────┐     ┌────────────────┐   │
│              │ PostgreSQL │     │  Ollama (LLM)  │   │
│              │  Database  │     │  Local Model   │   │
│              └────────────┘     └────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---
## 📁 Project Structure

```
AskDB/
├── docker-compose.yml          # Full stack deployment
├── .gitignore
├── README.md
│
├── frontend/                   # React + Tailwind CSS
│   ├── Dockerfile
│   ├── nginx.conf              # Production nginx config
│   ├── package.json
│   ├── tailwind.config.js      # Custom neon theme
│   ├── public/
│   │   └── index.html          # SEO-optimized HTML
│   └── src/
│       ├── index.js
│       ├── index.css            # Design system (animations, glow effects)
│       ├── App.js               # Main layout + state management
│       ├── services/
│       │   └── api.js           # Axios API client
│       └── components/
│           ├── Sidebar.js       # Collapsible sidebar with history + upload
│           ├── ChatInput.js     # Auto-expanding textarea
│           ├── Message.js       # Chat bubbles with SQL + table rendering
│           ├── WelcomeScreen.js # Landing screen with suggestions
│           ├── TypingIndicator.js # Animated loading dots
│           └── UploadPanel.js   # Drag-and-drop CSV upload
│
└── backend/                    # FastAPI + Python
    ├── Dockerfile
    ├── requirements.txt
    ├── .env                    # Environment variables
    └── app/
        ├── main.py             # FastAPI app + middleware
        ├── database.py         # SQLAlchemy engine
        ├── core/
        │   └── limiter.py      # Rate limiting config
        ├── routes/
        │   ├── upload.py       # CSV upload → PostgreSQL
        │   └── query.py        # Intent routing + query execution
        └── services/
            ├── active_table.py    # Tracks active dataset + context
            ├── cache.py           # Redis caching layer
            ├── chat_service.py    # Intent classifier + LLM chat/analytics
            ├── schema_service.py  # Dynamic schema extraction
            └── sql_generator.py   # LLM-powered SQL generation
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (for containerized deployment)
- **Ollama** with a model pulled (e.g., `ollama pull <model_name>`)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repo
git clone https://github.com/deep1904s/AskDB.git
cd AskDB

Ensure the AI inference service is running.

# Start all services
docker compose up --build

# Access the app
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
```

### Option 2: Manual Setup

```bash
# 1. Start PostgreSQL & Redis (or use Docker for just these)
docker compose up postgres redis -d

# 2. Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 3. Frontend
cd frontend
npm install
npm start

```

---

## ⚙️ Environment Variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<db_name>
OLLAMA_URL=http://localhost:11434/api/generate
MODEL_NAME=<model_name>
```

> When using Docker Compose, these are set automatically in `docker-compose.yml`.

---

## 🔄 How It Works

### Request Flow

```
User Message → Intent Classifier
    │
    ├── "Hello" → General Chat → LLM Response
    │
    ├── "Show top 5 salaries" → Data Query Pipeline:
    │       → Check Redis Cache
    │       → Get Active Table Schema
    │       → Generate SQL via LLM
    │       → Validate SQL (safety + schema)
    │       → Execute on PostgreSQL
    │       → Generate Explanation via LLM
    │       → Return: SQL + Results + Explanation
    │       → Cache SQL in Redis
    │       → Save Context for Follow-ups
    │
    └── "Summarize the above results" → Follow-up Analytics:
            → Retrieve Last Query Context
            → Send Results + Question to LLM
            → Return Analytical Response
```

### Intent Classification

| Intent | Trigger Examples | Action |
|--------|-----------------|--------|
| `general_chat` | "Hi", "What can you do?", "Explain SQL" | LLM conversational response |
| `data_query` | "Show all records", "Top 5 by salary" | SQL generation + execution |
| `follow_up_analytics` | "Summarize this", "Which is highest?" | Analyze previous results via LLM |

---

## ⚡ Performance Features

| Feature | Implementation |
|---------|---------------|
| **Redis Caching** | Table-scoped query cache with 5-min TTL |
| **Cache Invalidation** | Auto-flush on new dataset upload |
| **Rate Limiting** | 5-10 req/min per IP via SlowAPI |
| **Async Backend** | FastAPI with async endpoints |
| **LLM Timeouts** | 15-60s timeouts with smart fallbacks |
| **Context Limiting** | Max 20 rows stored for follow-ups |

---

## 🛡️ Security

- **Read-only SQL** — DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE are blocked
- **Schema enforcement** — AI-generated SQL is validated against actual column names
- **Rate limiting** — Prevents API abuse
- **CORS configured** — Controlled cross-origin access

---

## 🐳 Docker Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `frontend` | Node 18 → Nginx | 3000 | React SPA |
| `backend` | Python 3.11 | 8000 | FastAPI API |
| `postgres` | PostgreSQL 16 | 5432 | Data storage |
| `redis` | Redis 7 | 6379 | Query caching |
| `ollama` | *(host)* | 11434 | LLM inference |

---

## 🚀 Future Enhancements

- Multi-table joins and relationship inference
- Streaming LLM responses (real-time typing effect)
- Role-based authentication
- Dashboard visualizations (charts & analytics)
- Support for multiple database systems
- Persistent conversation history (database-backed)
- File format support beyond CSV (Excel, JSON)

---

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub!

---

## 📄 License & Contact

© 2026 Deepak Shinde. All rights reserved.

This project is developed and maintained as part of a professional portfolio.

**Deepak Shinde**
AI/ML Engineer
📧 Email: [deep1904s@gmail.com](mailto:deep1904s@gmail.com)
