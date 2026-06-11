import Database from "better-sqlite3";
import path from "path";
import { seedMatches } from "./seed";

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "vm1000.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    migrate(_db);
    seedMatches(_db);
  }
  return _db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS matches (
      id         TEXT PRIMARY KEY,
      match_no   INTEGER NOT NULL UNIQUE,
      phase      TEXT,
      home_team  TEXT NOT NULL,
      away_team  TEXT NOT NULL,
      starts_at  TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bets (
      id          TEXT PRIMARY KEY,
      player_id   TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      match_id    TEXT REFERENCES matches(id) ON DELETE SET NULL,
      match_label TEXT,
      description TEXT NOT NULL,
      odds        REAL NOT NULL,
      stake       REAL NOT NULL,
      status      TEXT NOT NULL DEFAULT 'pending',
      payout      REAL,
      settled_at  TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS competition_settings (
      id     TEXT PRIMARY KEY,
      locked INTEGER NOT NULL DEFAULT 0
    );

    INSERT OR IGNORE INTO competition_settings (id, locked) VALUES ('default', 0);
  `);

  // Migration: unique index on players.name (case-insensitive)
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS ux_players_name
    ON players (name COLLATE NOCASE);
  `);

  // Migration: avatar support
  try {
    db.exec(`ALTER TABLE players ADD COLUMN avatar_ext TEXT`);
  } catch {
    // Column already exists – ignore
  }
}
