# GrantGo Architecture

## Route Topology

- `app/(student)` for discovery and saved grants
- `app/(auth)` for login and signup/onboarding
- `app/(admin)/admin` for protected management workflows

## Data and Auth

- Supabase handles Auth + PostgreSQL
- `profiles` is auto-created through trigger on `auth.users`
- RLS policies gate writes to admin role and scope student reads/writes to self for profile/bookmarks
