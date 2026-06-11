/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Drop old collections in reverse dependency order.
  for (const name of ["bets", "competition_settings", "matches", "users"]) {
    try { app.delete(app.findCollectionByNameOrId(name)) } catch (_) {}
  }

  // Simple players collection — just a name, nothing else.
  const players = new Collection({ type: "base", name: "players" })
  players.listRule   = ""
  players.viewRule   = ""
  players.createRule = ""
  players.updateRule = ""
  players.deleteRule = ""
  players.fields.addMarshaledJSON(JSON.stringify([
    { type: "text", name: "name", required: true, presentable: true }
  ]))
  app.save(players)

  // Matches
  const matches = new Collection({ type: "base", name: "matches" })
  matches.listRule   = ""
  matches.viewRule   = ""
  matches.createRule = ""
  matches.updateRule = ""
  matches.deleteRule = ""
  matches.fields.addMarshaledJSON(JSON.stringify([
    { type: "number", name: "match_no", required: true, min: 1, onlyInt: true },
    { type: "date",   name: "starts_at" },
    { type: "text",   name: "home_team", required: true },
    { type: "text",   name: "away_team", required: true },
    { type: "text",   name: "phase" }
  ]))
  app.save(matches)

  // Bets — relation to players instead of users
  const bets = new Collection({ type: "base", name: "bets" })
  bets.listRule   = ""
  bets.viewRule   = ""
  bets.createRule = ""
  bets.updateRule = ""
  bets.deleteRule = ""
  bets.fields.addMarshaledJSON(JSON.stringify([
    { type: "relation", name: "player_id", collectionId: players.id, maxSelect: 1, required: true, cascadeDelete: true },
    { type: "relation", name: "match_id",  collectionId: matches.id, maxSelect: 1 },
    { type: "text",     name: "match_label" },
    { type: "text",     name: "description", required: true },
    { type: "number",   name: "odds",  required: true, min: 1.01 },
    { type: "number",   name: "stake", required: true, min: 0.01 },
    { type: "select",   name: "status", required: true, values: ["pending", "won", "lost", "void"] },
    { type: "number",   name: "payout", min: 0 },
    { type: "date",     name: "settled_at" }
  ]))
  app.save(bets)

  // Competition settings
  const settings = new Collection({ type: "base", name: "competition_settings" })
  settings.listRule   = ""
  settings.viewRule   = ""
  settings.createRule = ""
  settings.updateRule = ""
  settings.deleteRule = ""
  settings.fields.addMarshaledJSON(JSON.stringify([
    { type: "bool", name: "locked" }
  ]))
  app.save(settings)
}, (app) => {
  for (const name of ["bets", "competition_settings", "matches", "players"]) {
    try { app.delete(app.findCollectionByNameOrId(name)) } catch (_) {}
  }
})
