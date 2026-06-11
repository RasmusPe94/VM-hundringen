/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("competition_settings")
  const record = new Record(collection)

  record.set("locked", false)
  app.save(record)
}, (app) => {
  const collection = app.findCollectionByNameOrId("competition_settings")
  app.truncateCollection(collection)
})
