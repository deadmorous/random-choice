const express = require('express');
const _ = require('lodash')
const cookie = require('cookie');

const router = express.Router();

class Data
{
  constructor() {
    this.items = _.range(1, 31)
    this.topic = 'Testing'
    this.used = {}
    this.avail = _.range(this.items.length)
  }
  usedCount() {
    return this.items.length - this.avail.length
  }
  choice(ip) {
    let u = this.used[ip]
    return u === undefined? '': this.items[u]
  }
  choose(ip) {
    let u = this.used[ip]
    if (u === undefined) {
      if (this.avail.length > 0) {
        let iavail = Math.floor(Math.random() * this.avail.length)
        u = this.avail[iavail]
        this.avail.splice(iavail, 1)
        this.used[ip] = u
      }
      else
        return 'Все задачи уже разобрали :('
    }
    return this.items[u]
  }
  resetChoices() {
    this.used = {}
    this.avail = _.range(this.items.length)
  }
  format() {
    let lines = []
    for (let i=0, iavail=0; i<this.items.length; ++i) {
      let text = i.toString() + ': ' + this.items[i]
      if (this.avail[iavail] === i) {
        text += " (доступно)"
        ++iavail
      }
      else {
        text += " (выбрано)"
      }
      lines.push(text)
    }
    return `<h3>${this.topic}</h3>` + lines.join('<br/>')
  }
  formatUsed() {
    let lines = []
    _.each(this.used, (v, k) => lines.push(`  ${k}: ${v}`))
    return '{<br/>' + lines.join(',<br/>') + '<br/>}'
  }
  text() {
    return this.topic + '<br/>' + this.items.join('<br/>')
  }
  load(text) {
    this.items = text.trim().split(/\r?\n/)
    this.topic = this.items.splice(0, 1)[0]
    this.resetChoices()
  }
}
allChoices = [new Data]

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
    if (req.query.stage >= 0 && req.query.stage < allChoices.length) {
      req.currentData = allChoices[req.query.stage]
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
    res.render('admin', { data: req.currentData, stageCount: allChoices.length });
  })
  .get('/reset-9dc5086f-acdd-42c7-9c1b-8412483afbfb', function(req, res, next) {
    req.currentData.resetChoices()
    res.sendStatus(200)
  })
  .get('/upload-9dc5086f-acdd-42c7-9c1b-8412483afbfb', function(req, res, next) {
    let d = new Data
    allChoices.push(d)
    d.load(req.query.text)
    res.sendStatus(200)
  })
  .get('/remove-9dc5086f-acdd-42c7-9c1b-8412483afbfb', function(req, res, next) {
    if (allChoices.length > 1) {
      allChoices.splice(req.query.stage, 1)
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
