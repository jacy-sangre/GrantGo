cl# GrantGo

GrantGo is a scholarship discovery and application tracking platform built as a student-facing service with admin management tooling.

## Project Overview

GrantGo helps students discover scholarships, save interesting opportunities, and submit scholarship applications with progress tracking.
The platform is designed for students and scholarship administrators.

### Main purpose

- Centralize scholarship discovery in one place
- Let students save scholarships and manage applications
- Provide an admin interface to manage providers, regions, scholarships, and student applications
- Enforce data access rules through Supabase row-level security and authenticated user sessions

### Target users

- Students searching for scholarships
- Students saving and applying for grants
- Admins managing scholarship providers, regions, and application reviews

### Key features

- public marketing landing page with scholarship summary counts
- user signup, login, and password reset flows
- student dashboard with saved grants, recommendations, and profile
- scholarship browsing, favorites, and detailed application workflow
- application draft/save/submit flow with file uploads
- profile view/edit experience
- admin views for providers, scholarships, regions, and application oversight
- Supabase-based authentication and database access

## System Architecture

GrantGo is built as a Next.js 14 App Router project with a Supabase backend.

### Architecture flow

1. User visits the landing page (`app/page.tsx`)
2. Authenticated students interact with student routes under `app/(student)`
3. Admins use routes under `app/(admin)`
4. Auth flows are under `app/(auth)` and handled by Supabase Auth
5. Data is fetched client-side in most student/admin pages using `@supabase/ssr` browser client and Supabase session state
6. The database schema and access rules are managed through SQL migrations in `supabase/migrations`

### Frontend / backend connection

- `lib/supabase/client.ts`: creates a browser Supabase client for client components
- `lib/supabase/server.ts`: creates a server-side Supabase client using Next.js cookies for protected server-rendered pages
- `lib/auth/guards.ts`: helper functions for server-side auth checks and admin redirection
- Pages call Supabase queries directly instead of an API layer, using the Supabase JS client to read/write DB tables

### Folder structure

- `app/`: Next.js App Router routes and page components
  - `app/page.tsx`: public landing page
  - `app/(auth)/`: login, signup, forgot-password pages
  - `app/(student)/`: student-facing pages like scholarships, saved, applied, profile, dashboard
  - `app/(admin)/admin/`: admin dashboard and management pages
- `components/`: reusable UI and page components
  - `components/ui/`: buttons, cards, inputs, labels
  - `components/layout/`: header, sidebar
  - `components/admin/`: admin forms for providers, scholarships, regions
  - `components/tables/`: reusable data table UI
- `lib/`: shared utilities, validation schemas, auth guards, Supabase helpers, and types
- `supabase/`: database migrations, seed data, and SQL schema definitions
- `docs/`: architecture docs and ERD reference

### Technologies and libraries

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage)
- `@supabase/ssr` and `@supabase/supabase-js`
- React Hook Form + Zod for form validation
- Lucide icons and Sonner toast notifications
- TanStack React Table for admin tables

## Code Explanation

### Important pages and components

- `app/page.tsx`: public homepage that queries active scholarships, provider count, and region count from Supabase.
- `app/(auth)/login/page.tsx`: login page using `supabase.auth.signInWithPassword()`.
- `app/(auth)/signup/page.tsx`: signup page with region selection, password strength checks, email verification handling, and profile creation.
- `app/(auth)/forgot-password/page.tsx`: password reset flow via Supabase.
- `app/(student)/dashboard/page.tsx`: student dashboard showing saved grants count, recommended scholarships, and profile role.
- `app/(student)/scholarships/page.tsx`: scholarship browse page with save/unsave bookmark functionality.
- `app/(student)/scholarships/[id]/page.tsx`: scholarship detail and application flow where students can save, upload documents, save drafts, and submit applications.
- `app/(student)/saved/page.tsx`: saved scholarships list.
- `app/(student)/applied/page.tsx`: student application tracking page.
- `app/profile/page.tsx` and `app/profile/edit/page.tsx`: profile display and edit interfaces.
- `app/(admin)/admin/applications/page.tsx`: admin application review page with file download and status update actions.
- `components/layout/site-header.tsx`: persistent navigation header with auth-aware links.
- `components/admin/*`: admin forms for providers, regions, and scholarships (currently scaffolded with toast placeholders).

### Data flow

- Student- and admin-facing pages read from Supabase using the browser client.
- Authentication state is stored with Supabase and detected by `supabase.auth.getSession()`.
- Saved scholarships are stored in `bookmarks`.
- Applications are stored in `applications` and include JSON fields for applicant info, requirements, documents, and notes.
- File uploads are stored in Supabase Storage bucket `application-documents` and referenced by storage path in the application record.

### Authentication and authorization

- Sign-up and login are handled by Supabase Auth.
- `signup` creates a Supabase auth user and updates `profiles` with student metadata.
- Server-side auth guards (`requireAuth`, `requireAdmin`) redirect unauthorized users.
- Client pages check `sessionData.session?.user` and redirect to `/login` if missing.

### CRUD and database interactions

- `bookmarks` table: `insert` to save, `delete` to unsave, `select` to list saved items.
- `applications` table: `insert` or `update` to save drafts and submit, `delete` to remove draft applications.
- `profiles` table: `select` to load user profile, `update` to edit profile.
- `scholarships` table: `select` active scholarships and details.
- Admin pages scaffold create/edit forms but currently do not persist new records back to the database.

### Validation

- `lib/validations/auth.ts`: login, signup, forgot password, profile update validation using Zod.
- `lib/validations/scholarship.ts` and `provider.ts`: admin form validation schemas.
- `signup` uses a password-strength checker and requires strong passwords before enabling account creation.

## Database

The database is defined through Supabase SQL migrations and contains the following entities:

### Tables and entities

- `auth.users`: Supabase internal auth users table.
- `public.profiles`: user profile data linked to auth users by `id`.
- `public.regions`: region tags for students and scholarships.
- `public.categories`: scholarship categories.
- `public.providers`: scholarship provider records.
- `public.scholarships`: scholarship opportunities.
- `public.scholarship_regions`: many-to-many link between scholarships and regions.
- `public.scholarship_categories`: many-to-many link between scholarships and categories.
- `public.bookmarks`: saved scholarship bookmarks.
- `public.applications`: scholarship applications submitted by students.

### Important relationships

- `profiles.id` references `auth.users.id`.
- `scholarships.provider_id` references `providers.id`.
- `scholarship_regions.scholarship_id` references `scholarships.id` and `region_id` references `regions.id`.
- `scholarship_categories` links scholarships and categories.
- `bookmarks` links `profiles.id` to `scholarships.id`.
- `applications.user_id` references `profiles.id` and `scholarship_id` references `scholarships.id`.

### Key fields

- `profiles.role`: `'student'` or `'admin'`.
- `scholarships.status`: `'active'` or `'draft'`.
- `applications.status`: `'submitted'` or `'draft'`.
- `applications.application_data`, `requirements`, `applicant_info`, `uploaded_files`: JSON/JSONB fields for flexible application state.

### Database support for features

- RLS and policies enforce that students can only access their own profile, bookmarks, and applications.
- `public.is_admin()` determines admin privilege for management actions.
- Triggers keep timestamps up to date through `set_updated_at()`.
- Application storage is secured by a dedicated Supabase Storage bucket and policies tied to user IDs.

## Possible Q&A Preparation

### Technical questions

1. Why did you use Supabase instead of a custom Node API?
   - Supabase provides Auth, Postgres, Storage, and RLS in one managed backend, which speeds development and improves security.

2. How is authentication implemented?
   - Sign-up and login use Supabase Auth. Profile data is stored in `public.profiles` and the app checks `session.user.id` for authorization.

3. How are saved scholarships implemented?
   - Saved scholarships are stored in `public.bookmarks` as a join table between the logged-in student and scholarship records.

### Design decision questions

1. Why did you choose Next.js App Router?
   - It simplifies routing structure, server/client separation, and supports SSR/SSG with Supabase server clients.

2. Why use Zod with React Hook Form?
   - Zod provides schema validation and strong typings, while React Hook Form enables performant form state and easy integration.

### Security questions

1. How do you protect student application data?
   - Row-level security policies restrict application access to the owning user, and admin access is gated by `public.is_admin()`.

2. Could there be a vulnerability in client-side access control?
   - Yes. The app uses client checks, but the key protection must be database RLS. Any missing RLS policy would be a risk.

### Scalability questions

1. How would you scale this application?
   - Use pagination on scholarship listings, add query indexes for filters, and offload heavy analytics or notifications outside the main DB.

2. What are the main scalability bottlenecks?
   - Client-side full table reads and large JSON fields in `applications` may degrade performance at scale.

### Why specific technologies were chosen

- Next.js for modern React routing and ease of server-side rendering.
- Supabase for auth, storage, Postgres, and built-in RLS.
- Tailwind for fast UI styling.
- Zod for schema-driven validation.

### Challenges encountered

- Connecting Supabase auth session state to client and server page rendering.
- Designing application draft/save/submit flow and file uploads in a single form.
- Enforcing secure data boundaries with RLS.

### Future improvements

- Finish admin CRUD wiring so provider/region/scholarship forms persist data.
- Add explicit `scholarships` RLS policies for public read and admin write.
- Add pagination and search filters for scholarship and application lists.
- Add email notifications and admin review workflows.
- Add tests for auth, validations, and application flows.

### Weaknesses / limitations

- Some admin forms are currently scaffolded with toast notifications rather than real database writes.
- Scholarship management UI uses hardcoded mock data in the admin form.
- The `applications` route includes a large amount of client-side logic that could be refactored into reusable hooks.
- Potential missing RLS policy coverage for `scholarships` table in the visible migrations.

## Defense Preparation

### How to present the project

- Start with the problem: students need one place to discover, save, and apply for scholarships.
- Explain that GrantGo integrates frontend, auth, database, and storage into a single experience.
- Emphasize Supabase for secure auth and row-level security, and Next.js for fast UI and routing.
- Walk through the user flow: landing → signup → scholarship search → save → apply → track.
- Then describe the admin side: manage scholarship metadata and review applications.

### Summary for technical audience

GrantGo is a Next.js 14 application using Supabase Auth and PostgreSQL with row-level security. It supports student authentication, scholarship discovery, bookmarking, profile management, application drafts/submission, and admin review of applications. The app separates server-side auth helpers from client-side Supabase requests and uses Zod for robust validation.

### Summary for non-technical audience

GrantGo is a web service that helps students find scholarships, save the ones they like, and complete applications in one place. It also provides a backend admin view for trusted staff to manage opportunities and review student submissions.

### Elevator pitch

GrantGo is a scholarship gateway that turns scattered grant searches into a managed student journey: discover opportunities, save favorites, complete application drafts, and track submissions — all secured by Supabase and presented in a responsive Next.js dashboard.

## Most Important Things to Memorize Before Defense

- The app is built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Supabase.
- `profiles` is linked to Supabase Auth users and stores student metadata.
- `bookmarks` stores saved scholarships and `applications` stores student submissions.
- RLS policies enforce user-specific access and admin privilege using `public.is_admin()`.
- `createClient()` is for browser-side Supabase calls; `createServerSupabaseClient()` is for server-side auth-aware queries.
- Admin CRUD forms are scaffolded but not fully connected to real database insert/update operations.
- The biggest improvement area is completing admin persistence and explicitly defining all necessary RLS policies.

## Local setup

1. Install dependencies:
   - `npm install`
2. Add environment variables:
   - Copy `.env.example` to `.env.local`
3. Start development:
   - `npm run dev`

## Database reference

- Migrations are in `supabase/migrations/`
- Seed data lives in `supabase/seed.sql`
- ERD reference is available at `docs/erd.mmd`
