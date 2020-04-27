const {Datastore} = require('@google-cloud/datastore');
const Data = require('../Data.js')

// Instantiate a datastore client
const datastore = new Datastore();

const express = require('express');
const router = express.Router();

const entityKey = datastore.key({
  namespace: 'random-choice',
  path: ['app-data', 'random-choice-data']
})

const saveData = cb => datastore.save({
    key: entityKey,
    method: 'upsert',
    data: { taskSets: Data.toObject() }
  }, cb)

const loadData = cb => datastore.get(entityKey, (e, o) => {
  if (!e && o)
    Data.fromObject(o.taskSets)
  cb(e)
})

router
.get('/_ah/start', function(req, res, next) {
    loadData(e => {
      if (e)
        console.log(e)
      res.setHeader('Last-Modified', (new Date()).toUTCString());
      res.sendStatus(e? 500: 200)
    })
  })

.get('/_ah/stop', function(req, res, next) {
    saveData(e => {
      if (e)
        console.log(e)
      res.setHeader('Last-Modified', (new Date()).toUTCString());
      res.sendStatus(e? 500: 200)
      process.kill(process.pid, 'SIGTERM')
    })
})

module.exports = router;
