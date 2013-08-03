
var JsonSocket = require('json-socket')

RegExp.quote = function(str) {
    return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

function regstar(text) {
  return new RegExp(text.split('*').map(RegExp.quote).join('.*?'))
}

// An event emitter that uses a JsonSocket.
// emit passes things over the wire, and data received
// over the wire calls the listeners.
//
// As a result, se.on('foo', console.log); se.emit('foo', 5)
// won't do what you might normally expect from an emitter.

module.exports = SockEmitter

function SockEmitter(socket) {
  this._listeners = {}
  this._stars = {}
  this._anys = []
  this.sock = new JsonSocket(socket)
  this.sock.on('message', this._message.bind(this))
}

SockEmitter.prototype = {
  any: function (handler) {
    this._anys.push(handler)
  },
  offAny: function (handler) {
    var idx =this._anys.indexOf(handler)
    if (idx === -1) return false
    this._anys.splice(idx, 1)
    return true
  },
  on: function (type, handler) {
    var list = this._listeners
    if (type.indexOf('*') !== -1) {
      list = this._stars
    }
    if (!list[type]) {
      list[type] = [];
    }
    list[type].push(handler)
  },
  off: function (type, handler) {
    var list = this._listeners
    if (type.indexOf('*') !== -1) {
      list = this._stars
    }
    if (!list[type]) {
      return false
    }
    var idx = list[type].indexOf(handler)
    if (idx === -1) return false
    list[type].splice(idx, 1)
    return true
  },
  emit: function (type) {
    var args = [].slice.call(arguments, 1)
    this.sock.sendMessage({type: type, args: args})
  },
  _message: function (message) {
    if (!message || !message.type || !Array.isArray(message.args)) {
      return console.error('Invalid message received: %s', JSON.stringify(message))
    }
    this._check_stars(message.type, message.args)
    if (!this._listeners[message.type]) return
    this._listeners[message.type].forEach(function (handler) {
      handler.apply(null, message.args)
    })
  },
  _check_stars: function (type, args) {
    function handle(handler) {
      handler.apply({event: type}, args)
    }
    this._anys.forEach(handle)
    for (var star in this._stars) {
      if (!regstar(star).test(type)) {
        continue;
      }
      this._stars[star].forEach(handle)
    }
  }
}
