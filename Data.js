const _ = require('lodash')

class Data
{
  constructor() {
    this.topic = 'Testing'
    this.items = _.range(1, 31)
    this.used = {}
    this.avail = _.range(this.items.length)
  }
  usedCount() {
    return this.items.length - this.avail.length
  }
  choice(id) {
    let u = this.used[id]
    return u === undefined? '': this.items[u]
  }
  choose(id) {
    let u = this.used[id]
    if (u === undefined) {
      if (this.avail.length > 0) {
        let iavail = Math.floor(Math.random() * this.avail.length)
        u = this.avail[iavail]
        this.avail.splice(iavail, 1)
        this.used[id] = u
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
    let lines = _.map(this.used, (v, k) => `  ${k}: ${v}`)
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
  toObject() {
    return _.pick(this, ['items', 'topic', 'used'])
  }
  fromObject(obj) {
    _.extend(this, _.pick(obj, ['items', 'topic', 'used']))
    this.avail = _.range(this.items.length)
    _.each(this.used, u => {
      const i = _.sortedIndexOf(this.avail, u)
      if (i !== -1)
        this.avail.splice(i, 1)
    })
    return this
  }
  static toObject() {
    return _.map(Data.all, d => d.toObject())
  }
  static fromObject(arr) {
    Data.all = _.map(arr, obj => (new Data).fromObject(obj))
  }
}
Data.all = [new Data]

const fs = require('fs')
if (fs.existsSync('state.json'))
  Data.fromObject(JSON.parse(fs.readFileSync('state.json', 'utf8')))

module.exports = Data;
