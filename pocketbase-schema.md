# PocketBase schema

Create these collections in PocketBase. Use an auth collection named `users`
and enable identity/password auth with `username` as identity. Email can stay
unused.

## users

Auth collection. Add fields:

- `display_name`: text, required
- `role`: select, required, values `player`, `admin`, default `player`
- `starting_bankroll`: number, required, min `0`, default `100`

Recommended API rules:

- List/View: `@request.auth.id != ""`
- Create: only through PocketBase admin UI
- Update/Delete: `@request.auth.role = "admin"`

Create users in PocketBase with username and password. Promote admins by setting
`role` to `admin`.

## competition_settings

Base collection. Add fields:

- `locked`: bool
- `updated_by`: relation to `users`, max select 1, optional

Recommended API rules:

- List/View: `@request.auth.id != ""`
- Create/Update/Delete: `@request.auth.role = "admin"`

Create one record with `locked = false`. If it is missing, the app treats the
competition as unlocked and creates it the first time an admin saves the lock.

## matches

Base collection. Add fields:

- `match_no`: number, required, min `1`
- `starts_at`: date
- `home_team`: text, required
- `away_team`: text, required
- `phase`: text

Recommended API rules:

- List/View: `@request.auth.id != ""`
- Create/Update/Delete: `@request.auth.role = "admin"`

Add a unique index for `match_no`.

## bets

Base collection. Add fields:

- `user_id`: relation to `users`, max select 1, required
- `match_id`: relation to `matches`, max select 1, optional
- `match_label`: text
- `description`: text, required
- `odds`: number, required, min `1.01`
- `stake`: number, required, min `0.01`
- `status`: select, required, values `pending`, `won`, `lost`, `void`, default `pending`
- `payout`: number, min `0`
- `settled_at`: date
- `settled_by`: relation to `users`, max select 1, optional

Recommended API rules:

- List/View: `@request.auth.id != ""`
- Create:
  `@request.auth.id != "" && @request.data.user_id = @request.auth.id && @request.data.status = "pending"`
- Update:
  `@request.auth.role = "admin" || (@request.auth.id = user_id && status = "pending" && @request.data.status = "pending")`
- Delete:
  `@request.auth.role = "admin" || (@request.auth.id = user_id && status = "pending")`

The app also checks balance, lock state and ownership server-side before writes.
