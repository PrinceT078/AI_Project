# Medical AI Assistant

A full-stack medical triage assistant that collects patient-reported symptoms, uses a local Ollama model to extract symptoms and classify urgency, asks follow-up questions when confidence is low, and returns a concise clinical summary.

## Features

- React + TypeScript frontend for symptom intake and follow-up questions.
- Express + Node.js + TypeScript backend API.
- LangGraph stateful workflow for symptom processing with retry and conditional routing.
- Local Ollama inference using the `llama3.2` model.
- SQLite persistence for assessment sessions and graph checkpoints.
- Urgency classification: `LOW`, `MEDIUM`, or `HIGH`.
- Clinician-friendly summary generation.
- Automatic follow-up questions when model confidence is below 70%.

## Project Structure

```text
medical-ai-assistant/
  backend/
    src/
      app.ts                   # Express app entry point
      routers/router.ts        # API routes
      controller/controller.ts # Request handlers and graph orchestration
      graph/
        graph.ts              # LangGraph workflow definition
        state.ts              # Shared graph state schema
        nodes/
          validateInput.ts    # Rejects empty input
          extractSymptoms.ts  # LLM symptom extraction
          validateSymptoms.ts # Validates extracted symptoms, handles retries
          classifyUrgency.ts  # LLM urgency + confidence classification
          requireFollowup.ts  # Decides if follow-up is needed (confidence < 70)
          askFollowup.ts      # Generates follow-up questions
          generateSummary.ts  # Produces final clinical summary
      db/
        dbSetup.ts            # SQLite schema and initialization
        checkpointer.ts       # Graph checkpoint storage (save/resume nodes)
      utils/
        ollamaClient.ts       # Shared Ollama client instance
        constant.ts           # Graph node name constants
        sessionHelper.ts      # SQLite session CRUD helpers
    package.json
    tsconfig.json
    medical_sessions.db       # SQLite database, created at runtime
  frontend/
    src/
      App.tsx                 # Main UI state machine (input → followup → summary)
      api/client.ts           # Typed backend API client
      components/
        SymptomForm.tsx       # Initial symptom input form
        FollowupForm.tsx      # Follow-up questions form
        SummaryView.tsx       # Final clinical summary display
        LoadingSpinner.tsx    # Loading state
    package.json
    vite.config.ts
```

## Tech Stack

**Frontend**

- React 19
- TypeScript
- Vite
- ESLint

**Backend**

- Node.js
- Express 5
- TypeScript (`tsx` for development)
- LangGraph (`@langchain/langgraph`)
- Ollama JS client
- better-sqlite3

## Prerequisites

- Node.js 22+ and npm
- [Ollama](https://ollama.com/) installed and running locally
- The `llama3.2` model pulled in Ollama

Pull the model:

```bash
ollama pull llama3.2
```

Start Ollama before running the backend. The backend expects Ollama at `http://localhost:11434`.

## Setup

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Running Locally

Start the backend API:

```bash
cd backend
npm run dev
```

The backend runs on: http://localhost:3000

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The frontend runs on: http://localhost:5173

Open the frontend URL in your browser and submit a symptom description.

## Architecture

```text
User Input
    │
    ▼
React Frontend
    │  POST /chat
    ▼
Express API
    │
    ▼
LangGraph Workflow
    │
    ├─ validateInput
    │       │
    ├─ extractSymptoms ◄──────────────┐
    │       │                         │ retry if no symptoms
    ├─ validateSymptoms ──────────────┘ and retryCount ≤ maxRetries
    │       │
    │  (symptoms found)
    │       │
    ├─ classifyUrgency
    │       │
    ├─ requiresFollowup-----------
    │       │                    |
    │  confidence ≥ 70     confidence < 70
    │       │                    │
    ├─ generateSummary     askFollowup
    │       │                    │
    │       │            API response with questions
    │       │            (frontend submits answers)
    │       │            POST /followup/answers
    │       │                    │
    │       │            classifyUrgency (re-run)
    │       │                    │
    │       └────────────generateSummary
    │                            │
    ▼                            ▼
    SQLite (sessions + checkpoints)
              │
              ▼
API Response → React Frontend
```

## API Endpoints

### `POST /chat`

Starts a new symptom assessment.

**Request body:**

```json
{
  "patientInput": "I have had fever and cough for 3 days"
}
```

**Response when confidence is sufficient (≥ 70):**

```json
{
  "sessionId": "uuid",
  "requiresFollowup": false,
  "urgency": "MEDIUM",
  "confidence": 75,
  "summary": "Patient reports fever and cough for 3 days..."
}
```

**Response when follow-up is needed (confidence < 70):**

```json
{
  "sessionId": "uuid",
  "requiresFollowup": true,
  "followupQuestions": [
    "How long have you had this?",
    "Is it getting worse?"
  ]
}
```

### `POST /followup/answers`

Submits answers for a session that required follow-up. Resumes the graph from `classifyUrgency` with the additional context.

**Request body:**

```json
{
  "sessionId": "uuid",
  "followupAnswers": [
    "It started 3 days ago",
    "It is getting worse"
  ]
}
```

**Response:**

```json
{
  "urgency": "HIGH",
  "confidence": 82,
  "summary": "Patient reports..."
}
```

## Assessment Workflow

The backend graph runs these steps in order:

1. **validateInput** — Rejects empty input immediately.
2. **extractSymptoms** — Uses Ollama to extract a JSON array of symptoms from free-text.
3. **validateSymptoms** — Normalizes symptoms. If none are found and the retry limit is not reached, loops back to `extractSymptoms`.
4. **classifyUrgency** — Uses Ollama to classify `LOW`, `MEDIUM`, or `HIGH` urgency with a 0–100 confidence score.
5. **requiresFollowup** — If confidence is below `70`, routes to follow-up. Otherwise routes directly to summary.
6. **askFollowup** (conditional) — Generates 1–3 clarifying questions and checkpoints the state. Returns questions to the client; waits for answers via `POST /followup/answers`.
7. **generateSummary** — Produces a 2–3 sentence clinician-friendly summary and saves a checkpoint.

## Database

The backend uses SQLite through `better-sqlite3`. The database file is created automatically in the `backend/` directory when the server first starts.

**Tables:**

| Table | Purpose |
|---|---|
| `sessions` | Stores full assessment state keyed by `sessionId` |
| `checkpoints` | Stores serialized graph state at key nodes for resumability |

The database file (`medical_sessions.db`) is local runtime data and is added to `.gitignore`.

## Hard-coded Service URLs

| Service | URL |
|---|---|
| Frontend → Backend | `http://localhost:3000` |
| Backend CORS allow-list | `http://localhost:5173` |
| Backend → Ollama | `http://localhost:11434` |

## Notes and Known Limitations

- The app depends on Ollama running locally with the `llama3.2` model available.
- Ollama responses are parsed as JSON in several workflow nodes. The nodes use a regex to isolate the JSON object/array from any surrounding text, but highly malformed model output can still cause errors or fallback behavior.
- Medical safety guardrails are prompt-based only; no clinical validation is performed.
- There is no automated test suite configured.
- Sessions are not automatically purged. A `cleanupOldSessions` helper exists in `sessionHelper.ts` but is not scheduled. For long-running deployments, wire it to a periodic job.

## Why LangGraph Instead of a Simple Chain

A simple chain calls the LLM once and returns a result. This app needs more: extract symptoms, check if they make sense, maybe retry, classify urgency, decide if the model needs more info, ask follow-up questions, then summarize — and only some of those steps run every time.

LangGraph handles that branching cleanly. Each step is a separate node, the shared state is typed, and the routing logic lives in explicit conditional edges rather than buried in prompts.