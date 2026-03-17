# ContentForge

AI-powered SEO content system for marketing agencies and content teams. Enter a topic → get a complete SEO brief, article outline, meta tags, and full article draft — all powered by Claude AI.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **AI:** Claude API (claude-haiku-4-5)
- **Deployment:** Vercel

## Features

- 🎯 **SEO Brief Generation** — Target keyword, secondary keywords, search intent analysis
- 📋 **Article Outline** — H1/H2/H3 structure with talking points
- 🏷️ **Meta Tags** — Title, description, OG tags with character count validation
- ✍️ **Full Draft Generation** — Complete articles matching your outline and tone
- 📊 **Content History** — Dashboard with stats, search, and filters
- 📥 **Export** — Download as Markdown or plain text

## Getting Started

1. Clone the repo
2. Copy `.env.local.example` to `.env.local` and fill in values
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Architecture

```mermaid
graph TD
    A[User Input] --> B[Next.js App Router]
    B --> C[/api/generate]
    B --> D[/api/draft]
    B --> E[/api/content]
    B --> F[/api/export]
    C --> G[Claude API]
    D --> G
    C --> H[Supabase]
    D --> H
    E --> H
    F --> H
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Content generator
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── history/page.tsx      # Content history
│   ├── content/[id]/page.tsx # Content detail
│   └── api/
│       ├── generate/         # Brief + outline generation
│       ├── draft/            # Full article generation
│       ├── content/          # CRUD operations
│       └── export/           # File download
├── components/
│   ├── Navbar.tsx
│   ├── generator/            # Generator UI components
│   ├── history/              # History dashboard components
│   └── ui/                   # Base UI components
└── lib/
    ├── supabase.ts           # Database client
    ├── claude.ts             # AI client
    └── export.ts             # Export utilities
```

---

Built by **Abrar Tajwar Khan** — AI-powered tools for modern teams.
