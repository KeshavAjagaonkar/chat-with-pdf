# chat-with-pdf

**Upload any PDF. Ask questions. Get answers with exact page citations.**

A full-stack Retrieval-Augmented Generation (RAG) application that lets you have intelligent conversations with your PDF documents. Powered by Google's Gemini 2.5 Flash for LLM responses and Gemini Embedding 001 for semantic vector search, with PostgreSQL + pgvector for storage and Redis for real-time caching.

---

## ✨ Features

- **📄 Multi-File PDF Upload** — Upload up to 5 PDFs at once. They're combined into a single searchable document context.
- **💬 Real-Time Streaming Chat** — Responses stream token-by-token via Server-Sent Events (SSE). No waiting for the full response.
- **📌 Page-Level Citations** — Every answer includes exact page references (e.g., `[Page 14 of spec.pdf]`) so you can verify claims.
- **🔍 Semantic Vector Search** — Questions are matched against document content using cosine similarity on 3072-dimensional embeddings (pgvector).
- **⚡ Redis Query Cache** — Repeated questions are served from cache in <10ms. SHA-256 hashed and document-scoped for multi-tenant isolation.
- **📊 Real-Time Upload Progress** — Live pipeline status (extracting → chunking → embedding → complete) pushed via Redis polling.
- **🔐 Authentication** — Clerk-powered sign-in/sign-up with JWT verification. Every API call is authenticated and user-scoped.
- **🧠 Conversation Memory** — Chat history is persisted to PostgreSQL. Follow-up questions understand prior context.
- **📱 Premium Dark UI** — Zinc-black & amber design system with micro-animations, glassmorphism, and split-screen auth layouts.

---

## 🏗️ Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────────┐
│                  │     │                  │     │                          │
│  Next.js 16      │────▶│  Express.js 5    │────▶│  FastAPI (Python)        │
│  (Frontend)      │     │  (API Gateway)   │     │  (AI Services)           │
│                  │     │                  │     │                          │
│  • React 19      │     │  • Auth (Clerk)  │     │  • PDF Extraction        │
│  • TailwindCSS 4 │     │  • File Upload   │     │  • Text Chunking         │
│  • Clerk Auth    │     │  • SSE Proxy     │     │  • Gemini Embeddings     │
│  • ReactMarkdown │     │  • Message Save  │     │  • Gemini 2.5 Flash LLM  │
│                  │     │                  │     │  • Vector Search         │
│  Port: 3000      │     │  Port: 5000      │     │  Port: 8000              │
└──────────────────┘     └──────────────────┘     └────────┬─────────────────┘
                                                           │
                                              ┌────────────┴────────────┐
                                              │                         │
                                    ┌─────────▼──────────┐   ┌─────────▼─────────┐
                                    │  PostgreSQL 16      │   │  Redis 7          │
                                    │  + pgvector         │   │  (Alpine)         │
                                    │                     │   │                   │
                                    │  • documents        │   │  • Query Cache    │
                                    │  • chunks (vectors) │   │  • Pipeline       │
                                    │  • messages         │   │    Status         │
                                    │                     │   │                   │
                                    │  Port: 5432         │   │  Port: 6379       │
                                    └─────────────────────┘   └───────────────────┘
```

### How a Question Gets Answered

```
User Question
     │
     ▼
① Clerk JWT verified (Node.js middleware)
     │
     ▼
② Query embedding generated (Gemini Embedding 001, RETRIEVAL_QUERY task type)
     │
     ▼
③ Top-8 similar chunks retrieved (pgvector cosine distance: <=>)
     │
     ▼
④ Context + history + question assembled into structured prompt
     │
     ▼
⑤ Gemini 2.5 Flash streams response tokens via SSE
     │
     ▼
⑥ Node.js proxies stream to browser, saves messages + sources on [DONE]
     │
     ▼
⑦ Full answer cached in Redis (24h TTL, SHA-256 key)
```

### How a PDF Gets Ingested

```
PDF Upload
     │
     ▼
① File saved to temp storage, document row created in PostgreSQL
     │
     ▼
② Background task starts (FastAPI BackgroundTasks)
     │
     ▼
③ PyMuPDF extracts text per page → [{page: 1, text: "..."}, ...]
     │
     ▼
④ Word-stream chunking with overlap (500 words, 50 overlap, page tracking)
     │
     ▼
⑤ Gemini embeds each chunk (3072-dim vectors, exponential backoff retries)
     │
     ▼
⑥ Chunks + embeddings + metadata stored in PostgreSQL (pgvector)
     │
     ▼
⑦ Redis status updated at each step → frontend polls for progress
```

---

## 📁 Project Structure

```
chat-with-pdf/
│
├── ai-services/                  # Python FastAPI — core RAG engine
│   ├── main.py                   # API routes: /process, /chat/stream, /documents, /messages
│   ├── pipeline/
│   │   ├── extract.py            # PDF → per-page structured text (PyMuPDF)
│   │   ├── chunk.py              # Page-aware word-stream chunking with overlap
│   │   ├── embed.py              # Gemini Embedding 001 with exponential backoff
│   │   └── chat.py               # Prompt engineering + Gemini 2.5 Flash streaming
│   ├── db/
│   │   ├── pool.py               # PostgreSQL ThreadedConnectionPool (2–20 connections)
│   │   ├── setup.py              # Table creation + idempotent migrations
│   │   ├── store.py              # Insert documents and embedded chunks
│   │   ├── search.py             # pgvector cosine similarity search (top-8)
│   │   ├── query.py              # CRUD: messages, documents, ownership verification
│   │   └── redis_client.py       # Redis connection with graceful fallback
│   ├── Dockerfile
│   ├── requirements.txt
│   └── procfile                  # Railway deployment entry point
│
├── backend/                      # Node.js Express — API gateway & auth layer
│   ├── index.js                  # Express app setup, CORS, route mounting
│   ├── middleware/
│   │   └── auth.js               # Clerk JWT verification middleware
│   ├── routes/
│   │   ├── upload.js             # Multi-file PDF upload (multer, 10MB limit, PDF-only)
│   │   ├── chat.js               # SSE stream proxy + message persistence
│   │   ├── documents.js          # List, delete, status polling (proxied to Python)
│   │   └── messages.js           # Chat history retrieval
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                     # Next.js 16 — React 19 UI
│   ├── app/
│   │   ├── page.tsx              # Landing page (hero, features, FAQ accordion)
│   │   ├── layout.tsx            # Root layout (Clerk provider, Inter font, metadata)
│   │   ├── globals.css           # Design system (zinc/amber tokens, Clerk overrides)
│   │   ├── dashboard/page.tsx    # Upload zone, document list, search, progress cards
│   │   ├── documents/page.tsx    # All documents view with management actions
│   │   ├── chat/[documentId]/    # Chat interface (streaming, markdown, citations)
│   │   ├── sign-in/              # Clerk sign-in with split-screen layout
│   │   └── sign-up/              # Clerk sign-up with split-screen layout
│   ├── middleware.ts             # Clerk route protection (public: /, /sign-in, /sign-up)
│   ├── Dockerfile                # Multi-stage Next.js production build
│   └── package.json
│
├── docker-compose.yml            # Full-stack orchestration (5 services)
└── .gitignore
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React 19, TypeScript | Server/client components, routing |
| **Styling** | Tailwind CSS 4, PostCSS | Utility-first CSS, dark mode design system |
| **Auth** | Clerk (Next.js SDK + Backend SDK) | Sign-in/up, JWT verification, session management |
| **API Gateway** | Express.js 5, Node.js 20 | Auth middleware, file uploads, SSE proxy |
| **AI Services** | FastAPI, Python 3.11 | RAG pipeline, embeddings, LLM orchestration |
| **LLM** | Google Gemini 2.5 Flash | Streaming text generation with markdown formatting |
| **Embeddings** | Gemini Embedding 001 | 3072-dimensional document & query embeddings |
| **PDF Parsing** | PyMuPDF (fitz) | Layout-aware text extraction with page boundaries |
| **Vector DB** | PostgreSQL 16 + pgvector | Cosine similarity search on chunk embeddings |
| **Cache** | Redis 7 | Query response caching (24h) + pipeline status |
| **File Upload** | Multer | Multi-file upload, MIME validation, size limits |
| **Deployment** | Docker, Docker Compose | Container orchestration for all 5 services |
| **Markdown** | react-markdown + remark-gfm | Rich response rendering (tables, code, lists) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Python 3.11+](https://www.python.org/)
- [Docker & Docker Compose](https://www.docker.com/) (for database services)
- A [Google AI Studio](https://aistudio.google.com/) API key (Gemini)
- A [Clerk](https://clerk.com/) account (authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chat-with-pdf.git
cd chat-with-pdf
```

### 2. Set Up Environment Variables

**`ai-services/.env`**
```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://postgres:password@localhost:5432/chat_pdf
REDIS_URL=redis://localhost:6379/0
```

**`backend/.env`**
```env
PORT=5000
PYTHON_SERVICE_URL=http://localhost:8000
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 3. Start Infrastructure (PostgreSQL + Redis)

```bash
docker compose up postgres redis -d
```

This starts:
- **PostgreSQL 16** with pgvector extension on port `5432`
- **Redis 7** (Alpine) on port `6379`

### 4. Initialize the Database

```bash
cd ai-services
pip install -r requirements.txt
python db/setup.py
```

This creates the `documents`, `chunks`, and `messages` tables with the pgvector extension enabled.

### 5. Start the AI Services (Python)

```bash
cd ai-services
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 6. Start the Backend (Node.js)

```bash
cd backend
npm install
node index.js
```

### 7. Start the Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

### 8. Open the App

Navigate to **[http://localhost:3000](http://localhost:3000)** — sign up, upload a PDF, and start chatting.

---

## 🐳 Docker (Full Stack)

To run everything in containers with a single command:

```bash
# Set required API keys
export GEMINI_API_KEY=your_gemini_api_key
export CLERK_SECRET_KEY=your_clerk_secret_key
export CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Launch all 5 services
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend (API Gateway) | http://localhost:5000 |
| AI Services | http://localhost:8000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

## 📡 API Reference

### AI Services (FastAPI — Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/process` | Upload and process a PDF (returns instantly, processes in background) |
| `GET` | `/documents/status/{id}` | Real-time ingestion progress (from Redis) |
| `POST` | `/chat` | Non-streaming chat (fallback) |
| `POST` | `/chat/stream` | Streaming chat via SSE with Redis caching |
| `GET` | `/documents` | List user documents |
| `DELETE` | `/documents` | Delete a document and all associated data |
| `POST` | `/messages` | Save a chat message |
| `GET` | `/messages` | Fetch chat history for a document |
| `GET` | `/health` | Health check |

### Backend Gateway (Express — Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Multi-file PDF upload (auth required, 10MB limit, PDF-only) |
| `POST` | `/api/chat` | Non-streaming chat proxy |
| `POST` | `/api/chat/stream` | Streaming SSE chat proxy |
| `GET` | `/api/documents` | List authenticated user's documents |
| `DELETE` | `/api/documents/:id` | Delete a document |
| `GET` | `/api/documents/status/:id` | Pipeline progress polling |
| `GET` | `/api/messages` | Fetch chat history |
| `GET` | `/health` | Health check |

> **Note:** All `/api/*` routes (except `/health`) require a valid Clerk JWT in the `Authorization: Bearer <token>` header.

---

## 🗄️ Database Schema

```sql
-- Documents: one row per upload session
CREATE TABLE documents (
    id          SERIAL PRIMARY KEY,
    filename    TEXT NOT NULL,           -- comma-separated for multi-file uploads
    user_id     TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Chunks: embedded text segments with 3072-dim vectors
CREATE TABLE chunks (
    id          SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id),
    chunk_index INTEGER NOT NULL,
    text        TEXT NOT NULL,
    embedding   vector(3072),           -- pgvector cosine similarity
    metadata    JSONB DEFAULT '{}'      -- {pages: [3, 4], filename: "spec.pdf"}
);

-- Messages: persistent chat history with source citations
CREATE TABLE messages (
    id          SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id),
    user_id     TEXT NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content     TEXT NOT NULL,
    sources     JSONB DEFAULT NULL,     -- [{text, pages, filename}, ...]
    created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 🔑 Key Design Decisions

### Page-Aware Chunking
Unlike naive text splitting, the chunking pipeline builds a **word-stream** where every word carries its source page number. When a 500-word chunk crosses a page boundary (e.g., page 3 ends at word 480), the chunk correctly reports `pages: [3, 4]`. This enables precise page citations without polluting the embedding vectors with page markers.

### Embedding Isolation
Page metadata is **never** included in the text sent to the embedding model. Including `[Page 3]` would add noise to the semantic vector and make chunks about the same topic on different pages appear less similar. Embeddings represent *meaning*, not *location*.

### Message Ordering by Primary Key
Chat messages are ordered by `ORDER BY id ASC` (not `created_at`). When user and assistant messages are saved in rapid succession, timestamps can collide to the same millisecond — causing non-deterministic ordering. The auto-incrementing `id` guarantees strict sequential order.

### SSE Protocol Design
The Python → Node → Browser streaming pipeline uses a custom SSE protocol:
- `data: <JSON-encoded-chunk>` — LLM text (JSON encoding preserves newlines)
- `data: [SOURCES]<JSON-array>` — Citation metadata
- `data: [DONE]` — Stream termination signal
- `data: [Error: ...]` — Error propagation

Node.js buffers incoming TCP fragments and splits on `\n\n` boundaries to handle packet fragmentation correctly.

### Graceful Redis Fallback
Redis is optional. If Redis is unreachable at startup, the system falls back to non-cached mode — all uploads and queries work normally, just without response caching or live progress indicators.

---

## 🌐 Deployment

The project is designed for deployment on platforms like [Railway](https://railway.app/) or any Docker-compatible host.

Each service has its own `Dockerfile`:

| Service | Base Image | Notes |
|---------|-----------|-------|
| `ai-services` | `python:3.11-slim` | Includes `build-essential` + `libpq-dev` for psycopg2 |
| `backend` | `node:20-alpine` | Lightweight, production-only deps |
| `frontend` | `node:20-alpine` | Multi-stage build (deps → build → runner) |

The `Procfile` in `ai-services/` supports Railway's native deployment:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 🧪 Running Tests

```bash
cd ai-services
python test_extract.py
```

> ⚠️ `test_extract.py` currently uses legacy function signatures and may need updating.

---

## 📜 License

This project is open source. Feel free to fork, modify, and use it.

---

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) — LLM & embedding models
- [pgvector](https://github.com/pgvector/pgvector) — Vector similarity search for PostgreSQL
- [Clerk](https://clerk.com/) — Authentication
- [PyMuPDF](https://pymupdf.readthedocs.io/) — PDF text extraction
- [Next.js](https://nextjs.org/) — React framework
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
