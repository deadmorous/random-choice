var express = require('express');
const _ = require('lodash')
var router = express.Router();

oldChoices = []

class Data
{
  constructor() {
    this.items = ['1', '2', '3']
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
      let text = this.items[i]
      if (this.avail[iavail] === i) {
        text += " (доступно)"
        ++iavail
      }
      else {
        text += " (выбрано)"
      }
      lines.push(text)
    }
    return lines.join('<br/>')
  }
  load(text) {
    this.items = text.trim().split(/\r?\n/)
    this.resetChoices()
  }
}
let data = new Data

function backup() {
  if (data.cacheIndex === undefined) {
    data.cacheIndex = oldChoices.length
    oldChoices.push(data)
  }
  else
    oldChoices[data.cacheIndex] = data
}

function restore(index) {
  let d = oldChoices[index]
  if (d) {
    backup()
    data = d
    return true
  }
  else
    return false
}

/* GET home page. */
router
  .get('/', function(req, res, next) {
    res.render('index', {
      totalCount: data.items.length,
      usedCount: data.usedCount(),
      choice: data.choice(req.ip)
    })
  })
  .get('/choose', function(req, res, next) {
    res.send({choice: data.choose(req.ip)});
  })
  .get('/admin-9dc5086f-acdd-42c7-9c1b-8412483afbfb', function(req, res, next) {
    res.render('admin', { data: data, prevCount: oldChoices.length });
  })
  .get('/reset-9dc5086f-acdd-42c7-9c1b-8412483afbfb', function(req, res, next) {
    data.resetChoices()
    res.sendStatus(200)
  })
  .get('/upload-9dc5086f-acdd-42c7-9c1b-8412483afbfb', function(req, res, next) {
    backup()
    data = new Data
    data.load(req.query.text)
    res.sendStatus(200)
  })
  .get('/prev-9dc5086f-acdd-42c7-9c1b-8412483afbfb', function(req, res, next) {
    res.sendStatus(restore(req.query.n)? 200: 500)
  })

module.exports = router;
