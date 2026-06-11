/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Open up all collection rules since the app no longer uses PocketBase auth.
  // Identity is tracked via a simple cookie (user_id), not auth tokens.

  const openCollection = (name, opts = {}) => {
    try {
      const col = app.findCollectionByNameOrId(name)
      col.listRule   = opts.listRule   !== undefined ? opts.listRule   : ""
      col.viewRule   = opts.viewRule   !== undefined ? opts.viewRule   : ""
      col.createRule = opts.createRule !== undefined ? opts.createRule : ""
      col.updateRule = opts.updateRule !== undefined ? opts.updateRule : ""
      col.deleteRule = opts.deleteRule !== undefined ? opts.deleteRule : ""
      app.save(col)
    } catch (_) {
      // Collection not found — skip.
    }
  }

  // Anyone can create/read users. Updates/deletes go through the Next.js
  // server actions which use POCKETBASE_ADMIN_TOKEN, so rules can stay open.
  openCollection("users")
  openCollection("matches")
  openCollection("bets")
  openCollection("competition_settings")
}, (app) => {
  // Restore original restrictive rules on rollback.
  const restore = (name, rules) => {
    try {
      const col = app.findCollectionByNameOrId(name)
      Object.assign(col, rules)
      app.save(col)
    } catch (_) {}
  }

  restore("users", {
    listRule:   '@request.auth.id != ""',
    viewRule:   '@request.auth.id != ""',
    createRule: null,
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"'
  })
  restore("matches", {
    listRule:   '@request.auth.id != ""',
    viewRule:   '@request.auth.id != ""',
    createRule: '@request.auth.role = "admin"',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"'
  })
  restore("bets", {
    listRule:   '@request.auth.id != ""',
    viewRule:   '@request.auth.id != ""',
    createRule: '@request.auth.id != "" && @request.body.user_id = @request.auth.id && @request.body.status = "pending"',
    updateRule: '@request.auth.role = "admin" || (@request.auth.id = user_id && status = "pending")',
    deleteRule: '@request.auth.role = "admin" || (@request.auth.id = user_id && status = "pending")'
  })
  restore("competition_settings", {
    listRule:   '@request.auth.id != ""',
    viewRule:   '@request.auth.id != ""',
    createRule: '@request.auth.role = "admin"',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"'
  })
})
