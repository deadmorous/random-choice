const express = require('express');
const cookie = require('cookie');

const router = express.Router();
const Data = require('../Data.js')

function randomString() {
  // https://gist.github.com/6174/6062387
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/* GET home page. */
router
  .use(function (req, res, next) {
    if (!req.cookies.userId) {
      // Set a new cookie with the userId
      res.setHeader('Set-Cookie', cookie.serialize('userId', randomString(), {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365 // 1 year
      }));
      // Redirect back after setting cookie
      res.setHeader('Location', req.headers.referer || '/');
      return res.sendStatus(302);
    }
    next()
  })
  .use(function(req, res, next) {
    if (req.query.stage === undefined)
      req.query.stage = 0
    else
      req.query.stage = +req.query.stage
    if (req.query.stage >= 0 && req.query.stage < Data.all.length) {
      req.currentData = Data.all[req.query.stage]
      next()
    }
    else {
      res.sendStatus(400)
    }  
  })
  .get('/', function(req, res, next) {
    let d = req.currentData
    res.render('index', {
      topic: d.topic,
      totalCount: d.items.length,
      usedCount: d.usedCount(),
      choice: d.choice(req.cookies.userId),
      userId: req.cookies.userId
    })
  })
  .get('/choose', function(req, res, next) {
    res.send({choice: req.currentData.choose(req.cookies.userId)});
  })
  .get('/admin-9dc5086f-acdd-42c7-9c1b-8412483afbfb', function(req, res, next) {
    res.render('admin', { data: req.currentData, stageCount: Data.all.length });
  })
  .get('/reset-9dc5086f-acdd-42c7-9c1b-8412483afbfb', function(req, res, next) {
    req.currentData.resetChoices()
    res.sendStatus(200)
  })
  .get('/upload-9dc5086f-acdd-42c7-9c1b-8412483afbfb', function(req, res, next) {
    let d = new Data
    Data.all.push(d)
    d.load(req.query.text)
    res.sendStatus(200)
  })
  .get('/remove-9dc5086f-acdd-42c7-9c1b-8412483afbfb', function(req, res, next) {
    if (Data.all.length > 1) {
      Data.all.splice(req.query.stage, 1)
      res.sendStatus(200)
    }
    else {
      res.sendStatus(400)
    }
  })
  .get('/setUserId-5acf4296-deef-4367-ba1c-5ec4f987691e', function(req, res, next) {
    // Set a new cookie with the userId
    let userId = req.query.userId
    if (!(userId && userId.length > 10))
      return res.sendStatus(400)
    res.setHeader('Set-Cookie', cookie.serialize('userId', userId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365 // 1 year
    }));
    return res.sendStatus(200);
  })

module.exports = router;
