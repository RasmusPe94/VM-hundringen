# VM 1000 2026

Private football tournament betting competition for a friend group. The app replaces the old spreadsheet while keeping the same calculations: `payout` means returned amount including stake.

## Stack

- Next.js App Router
- TypeScript
- PocketBase
- Tailwind CSS
- Zod validation
- Server actions for mutations

## PocketBase setup

1. Start a PocketBase instance.
2. Create the collections in `pocketbase-schema.md`.
3. Create users in PocketBase with username and password. Email is not needed.
4. Promote the first admin by setting the user's `role` field to `admin`.

The PocketBase rules keep the app private: logged-in users can read the pool,
create and manage only their own pending bets, and admins can manage matches,
settings and settlement.

## Environment variables

Create `.env.local` with:

```bash
POCKETBASE_URL=http://127.0.0.1:8090
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
3. Add the same PocketBase environment variable.
4. Deploy.
