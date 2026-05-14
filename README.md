# PRASC Admin Panel

Next.js admin dashboard for viewing PRASC questionnaire submissions stored in Supabase.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.local.example` and add your Supabase URL and anon key.

3. Make sure your Supabase tables allow the anon role to read questionnaire answers, or replace the client-side read flow with a server route that uses a protected server key.

4. Run the app:

```bash
npm run dev
```

## Tables

- Industry: `questionnaire_answers_industry`
- Academia: `questionnaire_answers_academia`
- Government: `questionnaire_answers_government`
- Start-ups: `questionnaire_answers_startups`
- Investors: `questionnaire_answers_investors`

For now, login accepts any non-empty dummy email/name and password. If Supabase Auth credentials are configured and valid, the app will use Supabase login; otherwise it falls back to local dummy login.
