/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const users = app.findCollectionByNameOrId("users")

  users.fields.getByName("display_name").required = false
  users.fields.getByName("role").required = false
  users.fields.getByName("starting_bankroll").required = false

  app.save(users)
}, (app) => {
  const users = app.findCollectionByNameOrId("users")

  users.fields.getByName("display_name").required = true
  users.fields.getByName("role").required = true
  users.fields.getByName("starting_bankroll").required = true

  app.save(users)
})
