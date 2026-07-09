# Medical AI Assistant

A full-stack medical triage assistant that collects patient-reported symptoms, uses a local Ollama model to extract symptoms and classify urgency, asks follow-up questions when confidence is low, and returns a concise clinical summary.

## Features

- React + TypeScript frontend for symptom intake and follow-up questions.
- Express + Nodejs + TypeScript backend API.
- LangGraph workflow for symptom processing.
- Local Ollama inference using the `llama3.2` model.
- SQLite persistence for assessment sessions and graph checkpoints.
- Urgency classification with `LOW`, `MEDIUM`, or `HIGH` levels.
- Clinician-friendly summary generation.

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
        nodes/                # Workflow node implementations
      db/
        dbSetup.ts            # SQLite database setup
        checkpointer.ts       # Graph checkpoint storage
      utils/                  # Ollama client, constants, session helpers
    package.json
    medical_sessions.db       # Local SQLite database, generated at runtime
  frontend/
    src/
      App.tsx                 # Main UI state flow
      api/client.ts           # Backend API client
      components/             # Symptom, follow-up, summary, loading views
    package.json
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
- TypeScript
- LangGraph
- Ollama
- better-sqlite3

## Prerequisites

- Node.js and npm
- Ollama installed and running locally
- The `llama3.2` model pulled in Ollama

Install the model with:

```bash
ollama pull llama3.2
```

Start Ollama before running the backend. The backend expects Ollama at: http://localhost:11434


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
User Input → React Frontend → Express API → LangGraph Workflow → Ollama → SQLite Checkpointer → API Response → React Frontend
```

## API Endpoints

### `POST /chat`

Starts a new symptom assessment.

Request body:

```json
{
  "patientInput": "I have had fever and cough for 3 days"
}
```

If the model has enough confidence, the response includes the final summary:

```json
{
  "sessionId": "uuid",
  "requiresFollowup": false,
  "urgency": "MEDIUM",
  "confidence": 75,
  "summary": "Patient reports fever and cough for 3 days..."
}
```

If more information is needed, the response includes follow-up questions:

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

Submits answers for a session that required follow-up.

Request body:

```json
{
  "sessionId": "uuid",
  "followupAnswers": [
    "It started 3 days ago",
    "It is getting worse"
  ]
}
```

Example response:

```json
{
  "urgency": "HIGH",
  "confidence": 82,
  "summary": "Patient reports..."
}
```

### `POST /test`

Sends a raw prompt to Ollama. This is a development/debug endpoint.

## Assessment Workflow

The backend graph runs these steps:

1. Validate the patient input is not empty.
2. Extract symptoms from the free-text input using Ollama.
3. Classify urgency and confidence using Ollama.
4. Check whether follow-up is required. Follow-up is triggered when confidence is below `70`.
5. Generate follow-up questions when needed, then wait for answers.
6. Generate a concise clinical summary.

Follow-up sessions are stored in SQLite so the frontend can submit answers using the returned `sessionId`.

## Database

The backend uses SQLite through `better-sqlite3`.

Database file:
backend/medical_sessions.db

Tables are created automatically when the backend starts:

- `sessions`: stores assessment state by session ID.
- `checkpoints`: stores graph node checkpoints for resumability/debugging.

The database file is local runtime data and should usually be ignored in source control.

Current hard-coded local service URLs:

- Frontend expects the backend at `http://localhost:3000`.
- Backend CORS allows `http://localhost:5173`.
- Backend expects Ollama at `http://localhost:11434`.

## Notes and Known Limitations

- The app depends on local Ollama availability and the `llama3.2` model.
- Model output is parsed as JSON in several workflow nodes, so malformed model responses can cause errors or fallback behavior.
- Medical safety guardrails are prompt-based only.
- The frontend displays a disclaimer.
- The current backend has no automated test suite configured.

## Why LangGraph Instead of a Simple Chain

Patient triage is a stateful workflow, not a single linear LLM call. The app needs to extract symptoms, classify urgency, decide whether the model has enough confidence, ask follow-up questions when needed, and then incorporate the additional answers before producing a clinician-facing summary.

LangGraph is used because it makes those workflow decisions explicit. Each step is modeled as a focused node, shared assessment data lives in a typed graph state, and conditional edges route low-confidence cases to follow-up instead of forcing every request through the same path. This structure also supports retries, checkpointing, and future human-in-the-loop review, which are important for clinical decision-support workflows.

A simple chain would be easier to build, but it would hide the triage control flow inside prompts and application code. LangGraph keeps the branching logic visible, testable, and easier to extend safely.