# VM-hundringen 2026 🏆

Privat bettingtävling för fotbolls-VM 2026.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **better-sqlite3** (lokal SQLite-databas)

## Kom igång lokalt

```bash
npm install
npm run dev
```

Appen startar på [http://localhost:3000](http://localhost:3000).

Databasen skapas automatiskt vid första uppstart i `data/vm1000.db`. Alla VM 2026-matcher seedas automatiskt.

## Miljövariabler

Skapa en `.env.local`-fil vid behov:

```
ADMIN_CODE=ditt-lösenord     # Lösenord för adminportalen (standard: "admin")
DATABASE_PATH=data/vm1000.db # Sökväg till SQLite-filen
```

## Deploya (Fly.io)

```bash
fly deploy
```

Ladda ner databasen:

```bash
fly sftp get /data/vm1000.db ./backup.db
```
