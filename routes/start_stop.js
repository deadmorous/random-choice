const express = require('express');
const router = express.Router();
router
.get('/_ah/start', function(req, res, next) {
    console.log('Responding with 200 to /_ah/start')
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    res.sendStatus(200)
  })
.get('/_ah/stop', function(req, res, next) {
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    res.sendStatus(200)
    process.kill(process.pid, 'SIGTERM')
})

module.exports = router;
