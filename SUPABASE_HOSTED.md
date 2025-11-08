Hosted Supabase — Quick setup guide

This file explains how to connect the frontend in this repo to a hosted Supabase project and apply the included migration.

1) Confirm project details
- The repo contains `supabase/config.toml` with a `project_id`. If you already have a Supabase project, you can use its Project URL and anon (publishable) key.

2) Create local env file
- Copy the example and fill in your real values (do NOT commit real keys):

```bash
cp .env.example .env
# Edit .env and put your Supabase project's URL and anon key
```

3) Apply the migration to the hosted project (recommended)
- Open https://app.supabase.com and select your project.
- In the sidebar choose SQL → Editor → New query.
- Open the migration file in this repo: `supabase/migrations/20251108065317_1ca1eb0c-5e22-47ca-97d7-60e8442afa0e.sql` and copy its full contents.
- Paste the SQL into the dashboard editor and run it. The migration will:
  - create `profiles`, `projects`, `join_requests`, `project_members`, `comments`, `messages` tables,
  - enable RLS and create policies,
  - create the `handle_new_user` trigger to auto-create profiles on signup,
  - enable realtime for messages.

4) Start the frontend

```bash
npm ci
npm run dev
```

Open http://localhost:8080 and test signup, project creation, commenting and chat.

5) Security & cleanup notes
- The anon (publishable) key is ok for client-side code. Never expose the `service_role` key in the frontend.
- If an `.env` with real keys was committed, rotate those keys in the Supabase dashboard and replace the repo `.env` with `.env.example`.
- Add `.env` to `.gitignore` (this repo already does that after recent edits).

6) Troubleshooting
- If realtime doesn't work, check the Supabase project's Realtime settings and that the migration's `ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;` ran successfully.
- If RLS denies access, confirm policies exist and `auth.uid()` maps to correct user ids.

If you want, I can:
- Prepare a PR that replaces `.env` with `.env.example` and removes any committed secret values (I can detect and redact them),
- Or walk you through applying the migration in the dashboard step-by-step while you paste the SQL.
