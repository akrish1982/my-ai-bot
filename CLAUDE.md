# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application for creating and hosting AI chatbots with RAG (Retrieval-Augmented Generation). Users can create bots via a 3-step wizard, configure their personality/tone, add knowledge sources (URLs, files, text), set guardrails, and publish them at `/@username`.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Auth & Database**: Supabase (PostgreSQL with pgvector for embeddings)
- **AI**: AI SDK (`ai` package) with OpenAI + optional vLLM gateway
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Styling**: CSS Modules

## Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (configured via eslint.config.mjs)
```

## Architecture

### Bot Creation Flow (3-Step Wizard)

1. **Basic Info** (`/create` - Step 1): Name, tagline, description, tone sliders (friendly/professional/funny)
2. **Knowledge** (Step 2): Add URLs for RAG ingestion
3. **Guardrails** (Step 3): Topics to avoid, CTAs to promote

State is managed via Zustand (`src/lib/store/wizard-store.ts`). On submit, POST to `/api/bots` creates bot + knowledge sources, which triggers background ingestion.

### RAG System

**Knowledge Ingestion** (`supabase/functions/ingest-knowledge`):
- Triggered by database webhook when new `knowledge_sources` rows are inserted with status='pending'
- Fetches URL content, chunks text (~1000 chars, 200 overlap)
- Generates embeddings via OpenAI `text-embedding-3-small`
- Stores chunks in `knowledge_chunks` table with pgvector embeddings

**Chat API** (`src/app/api/chat/route.ts`):
- Receives messages + botId
- Generates embedding for user's query
- Calls `match_knowledge_chunks` RPC function (hybrid vector + full-text search)
- Constructs system prompt with retrieved context
- Streams response using `ModelGateway.streamText()`

### Model Gateway Pattern

`src/lib/model-gateway.ts` provides automatic failover:
1. Try vLLM (if `VLLM_API_URL` is set) with model from `VLLM_MODEL_NAME`
2. Fall back to OpenAI (default: `gpt-4o-mini`)

This allows optional self-hosted LLM with graceful degradation.

### Routing

- `/` - Landing page
- `/create` - Bot creation wizard (client component with steps)
- `/auth/login` - Authentication
- `/@<username>` (or `/%40<username>`) - Public bot chat page (dynamic route at `src/app/[username]/page.tsx`)
- `/api/bots` - POST endpoint for bot creation
- `/api/chat` - POST endpoint for chat (edge runtime)

Dynamic route strips `@` prefix and queries `profiles.username` to find user's public bot.

### Database Schema

Key tables:
- `profiles` - User profiles (synced from auth.users)
- `bots` - Bot configurations (name, tone, system_prompt, is_public)
- `knowledge_sources` - Raw knowledge inputs (urls/files/text) with status (pending/processing/completed/failed)
- `knowledge_chunks` - Chunked text with embeddings (vector(1536)) and search_vector (tsvector)
- `conversations` + `messages` - Chat history
- `bot_integrations` - External platform configs (e.g., Telegram)

The `match_knowledge_chunks` function performs hybrid search: 70% vector similarity + 30% full-text rank.

## Key Directories

- `src/app/` - Next.js App Router pages and API routes
- `src/components/ui/` - Reusable UI components (Button, Input, Card, Slider)
- `src/components/wizard/` - Bot creation wizard steps
- `src/components/public/` - Chat interface for public bot pages
- `src/lib/supabase/` - Supabase client/server setup
- `src/lib/store/` - Zustand stores
- `src/lib/model-gateway.ts` - AI model failover logic
- `supabase/` - Database schema, migrations, edge functions
- `types/` - TypeScript type definitions

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `OPENAI_API_KEY` - OpenAI API key (for embeddings + chat)
- `TELEGRAM_BOT_TOKEN` - (Optional) For Telegram integration

Optional:
- `VLLM_API_URL` - vLLM server URL for self-hosted models
- `VLLM_API_KEY` - vLLM API key (defaults to 'dummy' if not set)
- `VLLM_MODEL_NAME` - Model ID for vLLM (default: `meta-llama/Llama-2-7b-chat-hf`)

## Supabase Setup

Row Level Security (RLS) is enabled on all tables. Key policies:
- Public bots (`is_public=true`) are viewable by everyone
- Users can only modify their own bots/sources/integrations
- Knowledge chunks use `security definer` function for controlled search access

## Important Patterns

**Client vs Server Supabase**:
- Use `createClient()` from `@/lib/supabase/client` for client components
- Use `await createClient()` from `@/lib/supabase/server` for server components/API routes (handles cookies)

**Middleware**: `middleware.ts` runs `updateSession` on all routes (except static files) to refresh Supabase auth tokens.

**Type Safety**: Import Supabase types from `types/supabase.ts` (generated from schema).

**Edge Runtime**: Chat API uses edge runtime for streaming responses. Cannot use Node.js-only libraries here.
