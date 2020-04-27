const express = require('express');
const router = express.Router();
router
.get('/_ah/start', function(req, res, next) {
    res.sendStatus(200)
  })
.get('/_ah/stop', function(req, res, next) {
    res.sendStatus(200)
    process.kill(process.pid, 'SIGTERM')
})

module.exports = router;
