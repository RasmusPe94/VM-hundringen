# VM 1000 2026

Private football tournament betting competition for a friend group. The app replaces the old spreadsheet while keeping the same calculations: `payout` means returned amount including stake.

## Stack

- Next.js App Router
- TypeScript
- Supabase Postgres + Auth
- Tailwind CSS
- Zod validation
- Server actions for mutations

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase-schema.sql`.
4. Create your first user through Supabase Auth. The app login uses magic links but does not create unknown users.
5. Promote the first admin in SQL:

```sql
update public.profiles
set role = 'admin'
where id = 'USER_UUID_HERE';
```

The migration creates RLS policies so authenticated users can see all bets, create only their own pending bets, and edit/delete only their own pending bets. Admins can manage matches, profiles, competition settings, and settlement. Add participants by creating or inviting users in Supabase Auth, then manage their profile rows as admin or through SQL.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Checks

```bash
npm run lint
npm run typecheck
npm test
```

The calculation test covers the Excel-equivalent examples:

- Starting bankroll 100, stake 20, odds 1.74, won: `100 - 20 + 34.80 = 114.80`.
- Starting bankroll 100, stake 20, lost: `80`.
- Starting bankroll 100, stake 20, odds 2.50, pending: current balance `80`, potential payout `50`, possible total `130`.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Add the same Supabase environment variables.
4. Deploy.

Use the deployed URL as an allowed redirect URL in Supabase Auth settings so magic links return to the app.
