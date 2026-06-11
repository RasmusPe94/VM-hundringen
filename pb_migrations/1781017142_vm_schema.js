/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const findCollection = (name) => {
    try {
      return app.findCollectionByNameOrId(name)
    } catch (_) {
      return null
    }
  }

  const collection = (type, name) => {
    return findCollection(name) || new Collection({ type, name })
  }

  const setFields = (target, fields) => {
    target.fields.addMarshaledJSON(JSON.stringify(fields))
  }

  const users = collection("auth", "users")
  users.listRule = '@request.auth.id != ""'
  users.viewRule = '@request.auth.id != ""'
  users.createRule = null
  users.updateRule = '@request.auth.role = "admin"'
  users.deleteRule = '@request.auth.role = "admin"'
  users.authRule = ""
  users.passwordAuth.enabled = true
  users.passwordAuth.identityFields = ["username"]
  setFields(users, [
    {
      type: "text",
      name: "username",
      required: true,
      min: 1,
      max: 100,
      pattern: "^[a-zA-Z0-9_.-]+$",
      presentable: true
    },
    {
      type: "text",
      name: "display_name",
      presentable: true
    },
    {
      type: "select",
      name: "role",
      values: ["player", "admin"]
    },
    {
      type: "number",
      name: "starting_bankroll",
      min: 0
    }
  ])
  users.fields.getByName("email").required = false
  users.fields.getByName("email").hidden = true
  users.addIndex("idx_users_username", true, "username", "username != ''")

  app.save(users)

  const settings = collection("base", "competition_settings")
  settings.listRule = '@request.auth.id != ""'
  settings.viewRule = '@request.auth.id != ""'
  settings.createRule = '@request.auth.role = "admin"'
  settings.updateRule = '@request.auth.role = "admin"'
  settings.deleteRule = '@request.auth.role = "admin"'
  setFields(settings, [
    {
      type: "bool",
      name: "locked"
    },
    {
      type: "relation",
      name: "updated_by",
      collectionId: users.id,
      maxSelect: 1
    }
  ])

  app.save(settings)

  const matches = collection("base", "matches")
  matches.listRule = '@request.auth.id != ""'
  matches.viewRule = '@request.auth.id != ""'
  matches.createRule = '@request.auth.role = "admin"'
  matches.updateRule = '@request.auth.role = "admin"'
  matches.deleteRule = '@request.auth.role = "admin"'
  setFields(matches, [
    {
      type: "number",
      name: "match_no",
      required: true,
      min: 1,
      onlyInt: true
    },
    {
      type: "date",
      name: "starts_at"
    },
    {
      type: "text",
      name: "home_team",
      required: true
    },
    {
      type: "text",
      name: "away_team",
      required: true
    },
    {
      type: "text",
      name: "phase"
    }
  ])

  matches.addIndex("idx_matches_match_no", true, "match_no", "")
  app.save(matches)

  const bets = collection("base", "bets")
  bets.listRule = '@request.auth.id != ""'
  bets.viewRule = '@request.auth.id != ""'
  bets.createRule =
    '@request.auth.id != "" && @request.body.user_id = @request.auth.id && @request.body.status = "pending"'
  bets.updateRule =
    '@request.auth.role = "admin" || (@request.auth.id = user_id && status = "pending")'
  bets.deleteRule =
    '@request.auth.role = "admin" || (@request.auth.id = user_id && status = "pending")'
  setFields(bets, [
    {
      type: "relation",
      name: "user_id",
      collectionId: users.id,
      maxSelect: 1,
      required: true,
      cascadeDelete: true
    },
    {
      type: "relation",
      name: "match_id",
      collectionId: matches.id,
      maxSelect: 1
    },
    {
      type: "text",
      name: "match_label"
    },
    {
      type: "text",
      name: "description",
      required: true
    },
    {
      type: "number",
      name: "odds",
      required: true,
      min: 1.01
    },
    {
      type: "number",
      name: "stake",
      required: true,
      min: 0.01
    },
    {
      type: "select",
      name: "status",
      required: true,
      values: ["pending", "won", "lost", "void"]
    },
    {
      type: "number",
      name: "payout",
      min: 0
    },
    {
      type: "date",
      name: "settled_at"
    },
    {
      type: "relation",
      name: "settled_by",
      collectionId: users.id,
      maxSelect: 1
    }
  ])

  bets.addIndex("idx_bets_user_id", false, "user_id", "")
  bets.addIndex("idx_bets_match_id", false, "match_id", "")
  bets.addIndex("idx_bets_status", false, "status", "")
  app.save(bets)
}, (app) => {
  for (const name of ["bets", "matches", "competition_settings", "users"]) {
    try {
      app.delete(app.findCollectionByNameOrId(name))
    } catch (_) {
      // Collection already gone.
    }
  }
})
