# GrantGo

GrantGo is a scholarship discovery platform built with Next.js 14 and Supabase.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage)
- Zod + React Hook Form
- Shadcn-style component primitives, Lucide, Sonner

## Local setup

1. Install dependencies:
   - `npm install`
2. Add environment variables:
   - Copy `.env.example` to `.env.local`
3. Start development:
   - `npm run dev`

## Database

- Migration: `supabase/migrations/0001_grantgo_schema.sql`
- Seed: `supabase/seed.sql`
- ERD: `docs/erd.mmd`
