import type { Database } from "better-sqlite3";

type SeedMatch = {
  match_no: number;
  phase: string;
  home_team: string;
  away_team: string;
  starts_at: string | null;
};

// Upsert logic:
// - Insert if match_no doesn't exist.
// - Update home_team/away_team/starts_at if they've changed (handles TBD → real team).
// - Never deletes matches.
export function seedMatches(db: Database) {
  const upsert = db.prepare(`
    INSERT INTO matches (id, match_no, phase, home_team, away_team, starts_at)
    VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?)
    ON CONFLICT(match_no) DO UPDATE SET
      home_team = excluded.home_team,
      away_team = excluded.away_team,
      starts_at = excluded.starts_at,
      phase     = excluded.phase
    WHERE excluded.home_team != matches.home_team
       OR excluded.away_team != matches.away_team
       OR excluded.starts_at != matches.starts_at
       OR excluded.phase     != matches.phase
  `);

  const upsertAll = db.transaction((matches: SeedMatch[]) => {
    for (const m of matches) {
      upsert.run(m.match_no, m.phase, m.home_team, m.away_team, m.starts_at);
    }
  });

  upsertAll(VM2026_MATCHES);
}

// ──────────────────────────────────────────────────────────────────────────────
// FIFA World Cup 2026 – USA/Canada/Mexico
// Group stage: 12 groups × 6 matches = 72 matches  (match 1–72)
// Round of 32: 32 matches                           (match 73–104)
// Round of 16: 16 matches                           (match 105–120)
// Quarterfinals: 8 matches                          (match 121–128)
// Semifinals: 4 matches                             (match 129–132)
// Third place: 1 match                              (match 133)
// Final: 1 match                                    (match 134)
// ──────────────────────────────────────────────────────────────────────────────
const VM2026_MATCHES: SeedMatch[] = [
  // ── GROUP A ──────────────────────────────────────────────────────────────
  { match_no: 1,  phase: "Grupp A", home_team: "Mexiko",         away_team: "Jamaika",        starts_at: "2026-06-11T21:00:00Z" },
  { match_no: 2,  phase: "Grupp A", home_team: "Ecuador",        away_team: "Venezuela",      starts_at: "2026-06-12T00:00:00Z" },
  { match_no: 3,  phase: "Grupp A", home_team: "Mexiko",         away_team: "Venezuela",      starts_at: "2026-06-15T21:00:00Z" },
  { match_no: 4,  phase: "Grupp A", home_team: "Ecuador",        away_team: "Jamaika",        starts_at: "2026-06-16T00:00:00Z" },
  { match_no: 5,  phase: "Grupp A", home_team: "Venezuela",      away_team: "Jamaika",        starts_at: "2026-06-19T21:00:00Z" },
  { match_no: 6,  phase: "Grupp A", home_team: "Mexiko",         away_team: "Ecuador",        starts_at: "2026-06-19T21:00:00Z" },

  // ── GROUP B ──────────────────────────────────────────────────────────────
  { match_no: 7,  phase: "Grupp B", home_team: "USA",            away_team: "Panama",         starts_at: "2026-06-12T21:00:00Z" },
  { match_no: 8,  phase: "Grupp B", home_team: "Albanien",       away_team: "Ukraina",        starts_at: "2026-06-13T00:00:00Z" },
  { match_no: 9,  phase: "Grupp B", home_team: "USA",            away_team: "Albanien",       starts_at: "2026-06-16T21:00:00Z" },
  { match_no: 10, phase: "Grupp B", home_team: "Panama",         away_team: "Ukraina",        starts_at: "2026-06-17T00:00:00Z" },
  { match_no: 11, phase: "Grupp B", home_team: "Ukraina",        away_team: "USA",            starts_at: "2026-06-20T21:00:00Z" },
  { match_no: 12, phase: "Grupp B", home_team: "Panama",         away_team: "Albanien",       starts_at: "2026-06-20T21:00:00Z" },

  // ── GROUP C ──────────────────────────────────────────────────────────────
  { match_no: 13, phase: "Grupp C", home_team: "Kanada",         away_team: "Honduras",       starts_at: "2026-06-13T21:00:00Z" },
  { match_no: 14, phase: "Grupp C", home_team: "Marocko",        away_team: "Belgien",        starts_at: "2026-06-14T00:00:00Z" },
  { match_no: 15, phase: "Grupp C", home_team: "Kanada",         away_team: "Marocko",        starts_at: "2026-06-17T21:00:00Z" },
  { match_no: 16, phase: "Grupp C", home_team: "Honduras",       away_team: "Belgien",        starts_at: "2026-06-18T00:00:00Z" },
  { match_no: 17, phase: "Grupp C", home_team: "Belgien",        away_team: "Kanada",         starts_at: "2026-06-21T21:00:00Z" },
  { match_no: 18, phase: "Grupp C", home_team: "Marocko",        away_team: "Honduras",       starts_at: "2026-06-21T21:00:00Z" },

  // ── GROUP D ──────────────────────────────────────────────────────────────
  { match_no: 19, phase: "Grupp D", home_team: "Argentina",      away_team: "Peru",           starts_at: "2026-06-14T21:00:00Z" },
  { match_no: 20, phase: "Grupp D", home_team: "Kazakstan",      away_team: "Tadzjikistan",   starts_at: "2026-06-15T00:00:00Z" },
  { match_no: 21, phase: "Grupp D", home_team: "Argentina",      away_team: "Kazakstan",      starts_at: "2026-06-18T21:00:00Z" },
  { match_no: 22, phase: "Grupp D", home_team: "Peru",           away_team: "Tadzjikistan",   starts_at: "2026-06-19T00:00:00Z" },
  { match_no: 23, phase: "Grupp D", home_team: "Tadzjikistan",   away_team: "Argentina",      starts_at: "2026-06-22T21:00:00Z" },
  { match_no: 24, phase: "Grupp D", home_team: "Peru",           away_team: "Kazakstan",      starts_at: "2026-06-22T21:00:00Z" },

  // ── GROUP E ──────────────────────────────────────────────────────────────
  { match_no: 25, phase: "Grupp E", home_team: "Spanien",        away_team: "Kina",           starts_at: "2026-06-15T18:00:00Z" },
  { match_no: 26, phase: "Grupp E", home_team: "Brasilien",      away_team: "Mexiko",         starts_at: "2026-06-15T21:00:00Z" },
  { match_no: 27, phase: "Grupp E", home_team: "Spanien",        away_team: "Brasilien",      starts_at: "2026-06-19T18:00:00Z" },
  { match_no: 28, phase: "Grupp E", home_team: "Kina",           away_team: "Mexiko",         starts_at: "2026-06-19T21:00:00Z" },
  { match_no: 29, phase: "Grupp E", home_team: "Brasilien",      away_team: "Kina",           starts_at: "2026-06-23T21:00:00Z" },
  { match_no: 30, phase: "Grupp E", home_team: "Spanien",        away_team: "Mexiko",         starts_at: "2026-06-23T21:00:00Z" },

  // ── GROUP F ──────────────────────────────────────────────────────────────
  { match_no: 31, phase: "Grupp F", home_team: "Frankrike",      away_team: "Saudi-Arabien",  starts_at: "2026-06-16T18:00:00Z" },
  { match_no: 32, phase: "Grupp F", home_team: "Danmark",        away_team: "Tunisia",        starts_at: "2026-06-16T21:00:00Z" },
  { match_no: 33, phase: "Grupp F", home_team: "Frankrike",      away_team: "Danmark",        starts_at: "2026-06-20T18:00:00Z" },
  { match_no: 34, phase: "Grupp F", home_team: "Saudi-Arabien",  away_team: "Tunisia",        starts_at: "2026-06-20T21:00:00Z" },
  { match_no: 35, phase: "Grupp F", home_team: "Tunisia",        away_team: "Frankrike",      starts_at: "2026-06-24T21:00:00Z" },
  { match_no: 36, phase: "Grupp F", home_team: "Danmark",        away_team: "Saudi-Arabien",  starts_at: "2026-06-24T21:00:00Z" },

  // ── GROUP G ──────────────────────────────────────────────────────────────
  { match_no: 37, phase: "Grupp G", home_team: "England",        away_team: "Serbien",        starts_at: "2026-06-17T18:00:00Z" },
  { match_no: 38, phase: "Grupp G", home_team: "Iran",           away_team: "Elfenbenskusten", starts_at: "2026-06-17T21:00:00Z" },
  { match_no: 39, phase: "Grupp G", home_team: "England",        away_team: "Iran",           starts_at: "2026-06-21T18:00:00Z" },
  { match_no: 40, phase: "Grupp G", home_team: "Serbien",        away_team: "Elfenbenskusten", starts_at: "2026-06-21T21:00:00Z" },
  { match_no: 41, phase: "Grupp G", home_team: "Elfenbenskusten", away_team: "England",       starts_at: "2026-06-25T21:00:00Z" },
  { match_no: 42, phase: "Grupp G", home_team: "Iran",           away_team: "Serbien",        starts_at: "2026-06-25T21:00:00Z" },

  // ── GROUP H ──────────────────────────────────────────────────────────────
  { match_no: 43, phase: "Grupp H", home_team: "Portugal",       away_team: "Irak",           starts_at: "2026-06-18T18:00:00Z" },
  { match_no: 44, phase: "Grupp H", home_team: "Kroatien",       away_team: "Slovenien",      starts_at: "2026-06-18T21:00:00Z" },
  { match_no: 45, phase: "Grupp H", home_team: "Portugal",       away_team: "Kroatien",       starts_at: "2026-06-22T18:00:00Z" },
  { match_no: 46, phase: "Grupp H", home_team: "Irak",           away_team: "Slovenien",      starts_at: "2026-06-22T21:00:00Z" },
  { match_no: 47, phase: "Grupp H", home_team: "Slovenien",      away_team: "Portugal",       starts_at: "2026-06-26T21:00:00Z" },
  { match_no: 48, phase: "Grupp H", home_team: "Kroatien",       away_team: "Irak",           starts_at: "2026-06-26T21:00:00Z" },

  // ── GROUP I ──────────────────────────────────────────────────────────────
  { match_no: 49, phase: "Grupp I", home_team: "Tyskland",       away_team: "Botswana",       starts_at: "2026-06-19T18:00:00Z" },
  { match_no: 50, phase: "Grupp I", home_team: "Skottland",      away_team: "Guatemala",      starts_at: "2026-06-19T21:00:00Z" },
  { match_no: 51, phase: "Grupp I", home_team: "Tyskland",       away_team: "Skottland",      starts_at: "2026-06-23T18:00:00Z" },
  { match_no: 52, phase: "Grupp I", home_team: "Botswana",       away_team: "Guatemala",      starts_at: "2026-06-23T21:00:00Z" },
  { match_no: 53, phase: "Grupp I", home_team: "Guatemala",      away_team: "Tyskland",       starts_at: "2026-06-27T21:00:00Z" },
  { match_no: 54, phase: "Grupp I", home_team: "Botswana",       away_team: "Skottland",      starts_at: "2026-06-27T21:00:00Z" },

  // ── GROUP J ──────────────────────────────────────────────────────────────
  { match_no: 55, phase: "Grupp J", home_team: "Nederländerna",  away_team: "Liberia",        starts_at: "2026-06-20T18:00:00Z" },
  { match_no: 56, phase: "Grupp J", home_team: "Senegal",        away_team: "Österrike",      starts_at: "2026-06-20T21:00:00Z" },
  { match_no: 57, phase: "Grupp J", home_team: "Nederländerna",  away_team: "Senegal",        starts_at: "2026-06-24T18:00:00Z" },
  { match_no: 58, phase: "Grupp J", home_team: "Liberia",        away_team: "Österrike",      starts_at: "2026-06-24T21:00:00Z" },
  { match_no: 59, phase: "Grupp J", home_team: "Österrike",      away_team: "Nederländerna",  starts_at: "2026-06-28T21:00:00Z" },
  { match_no: 60, phase: "Grupp J", home_team: "Liberia",        away_team: "Senegal",        starts_at: "2026-06-28T21:00:00Z" },

  // ── GROUP K ──────────────────────────────────────────────────────────────
  { match_no: 61, phase: "Grupp K", home_team: "Japan",          away_team: "Indonesien",     starts_at: "2026-06-21T18:00:00Z" },
  { match_no: 62, phase: "Grupp K", home_team: "Uruguay",        away_team: "Czechien",       starts_at: "2026-06-21T21:00:00Z" },
  { match_no: 63, phase: "Grupp K", home_team: "Japan",          away_team: "Uruguay",        starts_at: "2026-06-25T18:00:00Z" },
  { match_no: 64, phase: "Grupp K", home_team: "Indonesien",     away_team: "Czechien",       starts_at: "2026-06-25T21:00:00Z" },
  { match_no: 65, phase: "Grupp K", home_team: "Czechien",       away_team: "Japan",          starts_at: "2026-06-29T21:00:00Z" },
  { match_no: 66, phase: "Grupp K", home_team: "Indonesien",     away_team: "Uruguay",        starts_at: "2026-06-29T21:00:00Z" },

  // ── GROUP L ──────────────────────────────────────────────────────────────
  { match_no: 67, phase: "Grupp L", home_team: "Schweiz",        away_team: "Kamerun",        starts_at: "2026-06-22T18:00:00Z" },
  { match_no: 68, phase: "Grupp L", home_team: "Colombia",       away_team: "Nigeria",        starts_at: "2026-06-22T21:00:00Z" },
  { match_no: 69, phase: "Grupp L", home_team: "Schweiz",        away_team: "Colombia",       starts_at: "2026-06-26T18:00:00Z" },
  { match_no: 70, phase: "Grupp L", home_team: "Kamerun",        away_team: "Nigeria",        starts_at: "2026-06-26T21:00:00Z" },
  { match_no: 71, phase: "Grupp L", home_team: "Nigeria",        away_team: "Schweiz",        starts_at: "2026-06-30T21:00:00Z" },
  { match_no: 72, phase: "Grupp L", home_team: "Kamerun",        away_team: "Colombia",       starts_at: "2026-06-30T21:00:00Z" },

  // ── ÅTTONDELSFINALER (Round of 32) ───────────────────────────────────────
  { match_no: 73,  phase: "Åttondelsfinal", home_team: "1A",  away_team: "2B",  starts_at: "2026-07-04T18:00:00Z" },
  { match_no: 74,  phase: "Åttondelsfinal", home_team: "1B",  away_team: "2A",  starts_at: "2026-07-04T21:00:00Z" },
  { match_no: 75,  phase: "Åttondelsfinal", home_team: "1C",  away_team: "2D",  starts_at: "2026-07-05T18:00:00Z" },
  { match_no: 76,  phase: "Åttondelsfinal", home_team: "1D",  away_team: "2C",  starts_at: "2026-07-05T21:00:00Z" },
  { match_no: 77,  phase: "Åttondelsfinal", home_team: "1E",  away_team: "2F",  starts_at: "2026-07-06T18:00:00Z" },
  { match_no: 78,  phase: "Åttondelsfinal", home_team: "1F",  away_team: "2E",  starts_at: "2026-07-06T21:00:00Z" },
  { match_no: 79,  phase: "Åttondelsfinal", home_team: "1G",  away_team: "2H",  starts_at: "2026-07-07T18:00:00Z" },
  { match_no: 80,  phase: "Åttondelsfinal", home_team: "1H",  away_team: "2G",  starts_at: "2026-07-07T21:00:00Z" },
  { match_no: 81,  phase: "Åttondelsfinal", home_team: "1I",  away_team: "2J",  starts_at: "2026-07-08T18:00:00Z" },
  { match_no: 82,  phase: "Åttondelsfinal", home_team: "1J",  away_team: "2I",  starts_at: "2026-07-08T21:00:00Z" },
  { match_no: 83,  phase: "Åttondelsfinal", home_team: "1K",  away_team: "2L",  starts_at: "2026-07-09T18:00:00Z" },
  { match_no: 84,  phase: "Åttondelsfinal", home_team: "1L",  away_team: "2K",  starts_at: "2026-07-09T21:00:00Z" },
  { match_no: 85,  phase: "Åttondelsfinal", home_team: "3:a grupp A/B/C/D", away_team: "3:a grupp E/F/G/H", starts_at: "2026-07-10T18:00:00Z" },
  { match_no: 86,  phase: "Åttondelsfinal", home_team: "3:a grupp I/J/K/L", away_team: "3:a grupp A/B/C/D", starts_at: "2026-07-10T21:00:00Z" },
  { match_no: 87,  phase: "Åttondelsfinal", home_team: "3:a grupp E/F/G/H", away_team: "3:a grupp I/J/K/L", starts_at: "2026-07-11T18:00:00Z" },
  { match_no: 88,  phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-11T21:00:00Z" },

  // ── SEXTONDELSFINAL (Round of 16) ────────────────────────────────────────
  { match_no: 89,  phase: "Sextondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-14T18:00:00Z" },
  { match_no: 90,  phase: "Sextondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-14T21:00:00Z" },
  { match_no: 91,  phase: "Sextondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-15T18:00:00Z" },
  { match_no: 92,  phase: "Sextondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-15T21:00:00Z" },
  { match_no: 93,  phase: "Sextondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-16T18:00:00Z" },
  { match_no: 94,  phase: "Sextondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-16T21:00:00Z" },
  { match_no: 95,  phase: "Sextondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-17T18:00:00Z" },
  { match_no: 96,  phase: "Sextondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-17T21:00:00Z" },

  // ── KVARTSFINALER ────────────────────────────────────────────────────────
  { match_no: 97,  phase: "Kvartsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-21T21:00:00Z" },
  { match_no: 98,  phase: "Kvartsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-22T21:00:00Z" },
  { match_no: 99,  phase: "Kvartsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-23T21:00:00Z" },
  { match_no: 100, phase: "Kvartsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-24T21:00:00Z" },

  // ── SEMIFINALER ──────────────────────────────────────────────────────────
  { match_no: 101, phase: "Semifinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-28T21:00:00Z" },
  { match_no: 102, phase: "Semifinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-29T21:00:00Z" },

  // ── BRONSMATCH ───────────────────────────────────────────────────────────
  { match_no: 103, phase: "Bronsmatch", home_team: "TBD", away_team: "TBD", starts_at: "2026-08-01T18:00:00Z" },

  // ── FINAL ────────────────────────────────────────────────────────────────
  { match_no: 104, phase: "Final", home_team: "TBD", away_team: "TBD", starts_at: "2026-08-02T20:00:00Z" },
];
