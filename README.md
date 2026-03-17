# ContentForge — AI SEO Content System

> Enter a topic. Get a complete SEO brief, article outline, meta tags, and full article draft — powered by Claude AI.

## Live Demo

[YOUR_VERCEL_URL]

## Features

- **SEO Brief** — target keyword, secondary keywords, search intent analysis, recommended word count
- **Article Outline** — H1/H2/H3 structure with talking points per section
- **Meta Tags** — title, description, OG tags with character count optimization
- **Full Article Draft** — complete markdown article matching the outline (~1,500 words)
- **Export** — download as `.md` or `.txt`
- **Content History** — dashboard with search, status filters, type filters, pagination

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| AI Model | Claude Haiku 4.5 |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS v4 |
| Fonts | Instrument Sans + JetBrains Mono |
| Deploy | Vercel |

## Architecture

```
User enters topic
  → POST /api/generate
  → Claude Haiku 4.5 (JSON response)
  → SEO brief + outline + meta saved to cf_content table
  → UI shows BriefPanel + OutlinePanel + MetaPanel

User clicks "Generate Full Draft"
  → POST /api/draft
  → Claude writes full article (~1,500 words)
  → word_count + full_draft saved, status → "drafted"
  → DraftPanel renders markdown

History Dashboard
  → GET /api/content
  → HistoryStats + FilterBar + ContentTable
  → Client-side filter by status, type, period, search
  → Optimistic delete with rollback
```

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.local.example` → `.env.local`
4. Fill in Supabase + Anthropic keys
5. `npm run dev`

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |

## API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/generate` | Topic → SEO brief + outline + meta (Claude) |
| `POST` | `/api/draft` | contentId → full article draft (Claude) |
| `GET` | `/api/content` | Fetch all content records |
| `DELETE` | `/api/content` | Delete a content record by ID |
| `GET` | `/api/content/[id]` | Fetch a single content record |
| `GET` | `/api/export` | Download `.md` or `.txt` for a content record |

## Database

Uses a shared Supabase project. Table prefix: `cf_` (ContentForge only touches these tables).

Main table: `cf_content` — 19 columns including topic, outline (JSONB), meta fields, full_draft, status.

---

Built by **Abrar Tajwar Khan**  
Available for custom AI development — [Fiverr](https://fiverr.com)
