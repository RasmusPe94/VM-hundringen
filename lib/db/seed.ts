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
// Round of 16 (Åttondelsfinal): 16 matches          (match 73–88)
// Quarterfinals (Kvartsfinal): 8 matches             (match 89–96)
// Semifinals (Semifinal): 4 matches                  (match 97–100)
// Third place (Bronsmatch): 1 match                  (match 101)
// Final: 1 match                                     (match 102)
// ──────────────────────────────────────────────────────────────────────────────
const VM2026_MATCHES: SeedMatch[] = [
  // ── GROUP A: Mexiko, Sydkorea, Tjeckien, Sydafrika ───────────────────────
  { match_no: 1,  phase: "Grupp A", home_team: "Mexiko",          away_team: "Sydafrika",          starts_at: "2026-06-11T19:00:00Z" },
  { match_no: 2,  phase: "Grupp A", home_team: "Sydkorea",        away_team: "Tjeckien",           starts_at: "2026-06-12T02:00:00Z" },
  { match_no: 25, phase: "Grupp A", home_team: "Tjeckien",        away_team: "Sydafrika",          starts_at: "2026-06-18T16:00:00Z" },
  { match_no: 28, phase: "Grupp A", home_team: "Mexiko",          away_team: "Sydkorea",           starts_at: "2026-06-19T01:00:00Z" },
  { match_no: 53, phase: "Grupp A", home_team: "Tjeckien",        away_team: "Mexiko",             starts_at: "2026-06-25T01:00:00Z" },
  { match_no: 54, phase: "Grupp A", home_team: "Sydafrika",       away_team: "Sydkorea",           starts_at: "2026-06-25T01:00:00Z" },

  // ── GROUP B: Kanada, Bosnien-Hercegovina, Qatar, Schweiz ─────────────────
  { match_no: 3,  phase: "Grupp B", home_team: "Kanada",          away_team: "Bosnien-Hercegovina", starts_at: "2026-06-12T23:00:00Z" },
  { match_no: 8,  phase: "Grupp B", home_team: "Qatar",           away_team: "Schweiz",            starts_at: "2026-06-13T23:00:00Z" },
  { match_no: 26, phase: "Grupp B", home_team: "Schweiz",         away_team: "Bosnien-Hercegovina", starts_at: "2026-06-18T23:00:00Z" },
  { match_no: 27, phase: "Grupp B", home_team: "Kanada",          away_team: "Qatar",              starts_at: "2026-06-19T02:00:00Z" },
  { match_no: 51, phase: "Grupp B", home_team: "Schweiz",         away_team: "Kanada",             starts_at: "2026-06-24T23:00:00Z" },
  { match_no: 52, phase: "Grupp B", home_team: "Bosnien-Hercegovina", away_team: "Qatar",          starts_at: "2026-06-24T23:00:00Z" },

  // ── GROUP C: Brasilien, Marocko, Haiti, Skottland ────────────────────────
  { match_no: 7,  phase: "Grupp C", home_team: "Brasilien",       away_team: "Marocko",            starts_at: "2026-06-13T22:00:00Z" },
  { match_no: 5,  phase: "Grupp C", home_team: "Haiti",           away_team: "Skottland",          starts_at: "2026-06-14T01:00:00Z" },
  { match_no: 30, phase: "Grupp C", home_team: "Skottland",       away_team: "Marocko",            starts_at: "2026-06-19T22:00:00Z" },
  { match_no: 29, phase: "Grupp C", home_team: "Brasilien",       away_team: "Haiti",              starts_at: "2026-06-20T00:30:00Z" },
  { match_no: 49, phase: "Grupp C", home_team: "Skottland",       away_team: "Brasilien",          starts_at: "2026-06-24T22:00:00Z" },
  { match_no: 50, phase: "Grupp C", home_team: "Marocko",         away_team: "Haiti",              starts_at: "2026-06-24T22:00:00Z" },

  // ── GROUP D: USA, Paraguay, Australien, Turkiet ───────────────────────────
  { match_no: 4,  phase: "Grupp D", home_team: "USA",             away_team: "Paraguay",           starts_at: "2026-06-13T01:00:00Z" },
  { match_no: 6,  phase: "Grupp D", home_team: "Australien",      away_team: "Turkiet",            starts_at: "2026-06-14T04:00:00Z" },
  { match_no: 32, phase: "Grupp D", home_team: "USA",             away_team: "Australien",         starts_at: "2026-06-19T19:00:00Z" },
  { match_no: 31, phase: "Grupp D", home_team: "Turkiet",         away_team: "Paraguay",           starts_at: "2026-06-20T03:00:00Z" },
  { match_no: 59, phase: "Grupp D", home_team: "Turkiet",         away_team: "USA",                starts_at: "2026-06-26T02:00:00Z" },
  { match_no: 60, phase: "Grupp D", home_team: "Paraguay",        away_team: "Australien",         starts_at: "2026-06-26T02:00:00Z" },

  // ── GROUP E: Tyskland, Elfenbenskusten, Ecuador, Curaçao ─────────────────
  { match_no: 10, phase: "Grupp E", home_team: "Tyskland",        away_team: "Curaçao",            starts_at: "2026-06-14T16:00:00Z" },
  { match_no: 9,  phase: "Grupp E", home_team: "Elfenbenskusten", away_team: "Ecuador",            starts_at: "2026-06-14T23:00:00Z" },
  { match_no: 33, phase: "Grupp E", home_team: "Tyskland",        away_team: "Elfenbenskusten",    starts_at: "2026-06-20T20:00:00Z" },
  { match_no: 34, phase: "Grupp E", home_team: "Ecuador",         away_team: "Curaçao",            starts_at: "2026-06-21T00:00:00Z" },
  { match_no: 55, phase: "Grupp E", home_team: "Curaçao",         away_team: "Elfenbenskusten",    starts_at: "2026-06-25T20:00:00Z" },
  { match_no: 56, phase: "Grupp E", home_team: "Ecuador",         away_team: "Tyskland",           starts_at: "2026-06-25T20:00:00Z" },

  // ── GROUP F: Nederländerna, Japan, Sverige, Tunisien ─────────────────────
  { match_no: 11, phase: "Grupp F", home_team: "Nederländerna",   away_team: "Japan",              starts_at: "2026-06-14T20:00:00Z" },
  { match_no: 12, phase: "Grupp F", home_team: "Sverige",         away_team: "Tunisien",           starts_at: "2026-06-15T02:00:00Z" },
  { match_no: 35, phase: "Grupp F", home_team: "Nederländerna",   away_team: "Sverige",            starts_at: "2026-06-20T17:00:00Z" },
  { match_no: 36, phase: "Grupp F", home_team: "Tunisien",        away_team: "Japan",              starts_at: "2026-06-21T04:00:00Z" },
  { match_no: 57, phase: "Grupp F", home_team: "Japan",           away_team: "Sverige",            starts_at: "2026-06-25T23:00:00Z" },
  { match_no: 58, phase: "Grupp F", home_team: "Tunisien",        away_team: "Nederländerna",      starts_at: "2026-06-26T23:00:00Z" },

  // ── GROUP G: Belgien, Egypten, Iran, Nya Zeeland ─────────────────────────
  { match_no: 16, phase: "Grupp G", home_team: "Belgien",         away_team: "Egypten",            starts_at: "2026-06-15T19:00:00Z" },
  { match_no: 15, phase: "Grupp G", home_team: "Iran",            away_team: "Nya Zeeland",        starts_at: "2026-06-16T01:00:00Z" },
  { match_no: 39, phase: "Grupp G", home_team: "Belgien",         away_team: "Iran",               starts_at: "2026-06-21T19:00:00Z" },
  { match_no: 40, phase: "Grupp G", home_team: "Nya Zeeland",     away_team: "Egypten",            starts_at: "2026-06-22T01:00:00Z" },
  { match_no: 63, phase: "Grupp G", home_team: "Egypten",         away_team: "Iran",               starts_at: "2026-06-27T03:00:00Z" },
  { match_no: 64, phase: "Grupp G", home_team: "Nya Zeeland",     away_team: "Belgien",            starts_at: "2026-06-27T03:00:00Z" },

  // ── GROUP H: Spanien, Saudiarabien, Uruguay, Kap Verde ───────────────────
  { match_no: 14, phase: "Grupp H", home_team: "Spanien",         away_team: "Kap Verde",          starts_at: "2026-06-15T16:00:00Z" },
  { match_no: 13, phase: "Grupp H", home_team: "Saudiarabien",    away_team: "Uruguay",            starts_at: "2026-06-15T22:00:00Z" },
  { match_no: 38, phase: "Grupp H", home_team: "Spanien",         away_team: "Saudiarabien",       starts_at: "2026-06-21T16:00:00Z" },
  { match_no: 37, phase: "Grupp H", home_team: "Uruguay",         away_team: "Kap Verde",          starts_at: "2026-06-21T22:00:00Z" },
  { match_no: 65, phase: "Grupp H", home_team: "Kap Verde",       away_team: "Saudiarabien",       starts_at: "2026-06-27T00:00:00Z" },
  { match_no: 66, phase: "Grupp H", home_team: "Uruguay",         away_team: "Spanien",            starts_at: "2026-06-27T01:00:00Z" },

  // ── GROUP I: Frankrike, Senegal, Irak, Norge ─────────────────────────────
  { match_no: 17, phase: "Grupp I", home_team: "Frankrike",       away_team: "Senegal",            starts_at: "2026-06-16T19:00:00Z" },
  { match_no: 18, phase: "Grupp I", home_team: "Irak",            away_team: "Norge",              starts_at: "2026-06-16T22:00:00Z" },
  { match_no: 42, phase: "Grupp I", home_team: "Frankrike",       away_team: "Irak",               starts_at: "2026-06-22T21:00:00Z" },
  { match_no: 41, phase: "Grupp I", home_team: "Norge",           away_team: "Senegal",            starts_at: "2026-06-23T00:00:00Z" },
  { match_no: 61, phase: "Grupp I", home_team: "Norge",           away_team: "Frankrike",          starts_at: "2026-06-26T19:00:00Z" },
  { match_no: 62, phase: "Grupp I", home_team: "Senegal",         away_team: "Irak",               starts_at: "2026-06-26T19:00:00Z" },

  // ── GROUP J: Argentina, Algeriet, Österrike, Jordanien ───────────────────
  { match_no: 19, phase: "Grupp J", home_team: "Argentina",       away_team: "Algeriet",           starts_at: "2026-06-17T01:00:00Z" },
  { match_no: 20, phase: "Grupp J", home_team: "Österrike",       away_team: "Jordanien",          starts_at: "2026-06-17T04:00:00Z" },
  { match_no: 43, phase: "Grupp J", home_team: "Argentina",       away_team: "Österrike",          starts_at: "2026-06-22T20:00:00Z" },
  { match_no: 44, phase: "Grupp J", home_team: "Jordanien",       away_team: "Algeriet",           starts_at: "2026-06-23T03:00:00Z" },
  { match_no: 69, phase: "Grupp J", home_team: "Algeriet",        away_team: "Österrike",          starts_at: "2026-06-28T01:00:00Z" },
  { match_no: 70, phase: "Grupp J", home_team: "Jordanien",       away_team: "Argentina",          starts_at: "2026-06-28T01:00:00Z" },

  // ── GROUP K: Portugal, Colombia, DR Kongo, Uzbekistan ────────────────────
  { match_no: 23, phase: "Grupp K", home_team: "Portugal",        away_team: "DR Kongo",           starts_at: "2026-06-17T17:00:00Z" },
  { match_no: 24, phase: "Grupp K", home_team: "Uzbekistan",      away_team: "Colombia",           starts_at: "2026-06-18T02:00:00Z" },
  { match_no: 47, phase: "Grupp K", home_team: "Portugal",        away_team: "Uzbekistan",         starts_at: "2026-06-23T17:00:00Z" },
  { match_no: 48, phase: "Grupp K", home_team: "Colombia",        away_team: "DR Kongo",           starts_at: "2026-06-24T02:00:00Z" },
  { match_no: 71, phase: "Grupp K", home_team: "Colombia",        away_team: "Portugal",           starts_at: "2026-06-27T23:30:00Z" },
  { match_no: 72, phase: "Grupp K", home_team: "DR Kongo",        away_team: "Uzbekistan",         starts_at: "2026-06-27T23:30:00Z" },

  // ── GROUP L: England, Kroatien, Ghana, Panama ────────────────────────────
  { match_no: 22, phase: "Grupp L", home_team: "England",         away_team: "Kroatien",           starts_at: "2026-06-17T20:00:00Z" },
  { match_no: 21, phase: "Grupp L", home_team: "Ghana",           away_team: "Panama",             starts_at: "2026-06-17T23:00:00Z" },
  { match_no: 45, phase: "Grupp L", home_team: "England",         away_team: "Ghana",              starts_at: "2026-06-23T20:00:00Z" },
  { match_no: 46, phase: "Grupp L", home_team: "Panama",          away_team: "Kroatien",           starts_at: "2026-06-23T23:00:00Z" },
  { match_no: 67, phase: "Grupp L", home_team: "Panama",          away_team: "England",            starts_at: "2026-06-27T21:00:00Z" },
  { match_no: 68, phase: "Grupp L", home_team: "Kroatien",        away_team: "Ghana",              starts_at: "2026-06-27T21:00:00Z" },

  // ── ÅTTONDELSFINAL (Round of 16) ─────────────────────────────────────────
  { match_no: 73, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-04T18:00:00Z" },
  { match_no: 74, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-04T21:00:00Z" },
  { match_no: 75, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-05T18:00:00Z" },
  { match_no: 76, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-05T21:00:00Z" },
  { match_no: 77, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-06T18:00:00Z" },
  { match_no: 78, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-06T21:00:00Z" },
  { match_no: 79, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-07T18:00:00Z" },
  { match_no: 80, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-07T21:00:00Z" },
  { match_no: 81, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-08T18:00:00Z" },
  { match_no: 82, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-08T21:00:00Z" },
  { match_no: 83, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-09T18:00:00Z" },
  { match_no: 84, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-09T21:00:00Z" },
  { match_no: 85, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-10T18:00:00Z" },
  { match_no: 86, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-10T21:00:00Z" },
  { match_no: 87, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-11T18:00:00Z" },
  { match_no: 88, phase: "Åttondelsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-11T21:00:00Z" },

  // ── KVARTSFINAL ──────────────────────────────────────────────────────────
  { match_no: 89, phase: "Kvartsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-14T18:00:00Z" },
  { match_no: 90, phase: "Kvartsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-14T21:00:00Z" },
  { match_no: 91, phase: "Kvartsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-15T18:00:00Z" },
  { match_no: 92, phase: "Kvartsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-15T21:00:00Z" },
  { match_no: 93, phase: "Kvartsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-17T18:00:00Z" },
  { match_no: 94, phase: "Kvartsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-17T21:00:00Z" },
  { match_no: 95, phase: "Kvartsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-18T18:00:00Z" },
  { match_no: 96, phase: "Kvartsfinal", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-18T21:00:00Z" },

  // ── SEMIFINAL ────────────────────────────────────────────────────────────
  { match_no: 97,  phase: "Semifinal",  home_team: "TBD", away_team: "TBD", starts_at: "2026-07-21T21:00:00Z" },
  { match_no: 98,  phase: "Semifinal",  home_team: "TBD", away_team: "TBD", starts_at: "2026-07-22T21:00:00Z" },
  { match_no: 99,  phase: "Semifinal",  home_team: "TBD", away_team: "TBD", starts_at: "2026-07-24T21:00:00Z" },
  { match_no: 100, phase: "Semifinal",  home_team: "TBD", away_team: "TBD", starts_at: "2026-07-25T21:00:00Z" },

  // ── BRONSMATCH ───────────────────────────────────────────────────────────
  { match_no: 101, phase: "Bronsmatch", home_team: "TBD", away_team: "TBD", starts_at: "2026-07-28T20:00:00Z" },

  // ── FINAL ────────────────────────────────────────────────────────────────
  { match_no: 102, phase: "Final",      home_team: "TBD", away_team: "TBD", starts_at: "2026-07-29T20:00:00Z" },
];
