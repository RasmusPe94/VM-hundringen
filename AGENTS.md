# AGENTS.md - VM 1000 2026

This is a private football tournament betting competition app for a friend group.

Core rule:
- Each player starts with 100 SEK.
- `payout` means returned amount including stake, matching the old Excel file.
- Balance = starting_bankroll - all stakes + settled payouts.
- Pending potential payout = stake * odds.

Do not add:
- real-money payment handling
- public gambling functionality
- external odds providers

Prefer:
- TypeScript
- Supabase RLS
- database views for calculations
- small, readable components
- Swedish UI copy

Before completing work:
- run lint/typecheck/tests if available
- verify leaderboard calculations match the Excel examples
