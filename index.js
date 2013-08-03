
var JsonSocket = require('json-socket')

// An event emitter that uses a JsonSocket.
// emit passes things over the wire, and data received
// over the wire calls the listeners.
//
// As a result, se.on('foo', console.log); se.emit('foo', 5)
// won't do what you might normally expect from an emitter.

module.exports = SockEmitter

function SockEmitter(socket) {
  this._listeners = {}
  this.sock = new JsonSocket(socket)
  this.sock.on('message', this._message.bind(this))
}

SockEmitter.prototype = {
  on: function (type, handler) {
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(handler)
  },
  off: function (type, handler) {
    if (!this._listeners[type]) {
      return false
    }
    var idx = this._listeners[type].indexOf(handler)
    if (idx === -1) return false
    this._listeners[type].splice(idx, 1)
    return true
  },
  emit: function (type) {
    var args = [].slice.call(arguments, 1)
    this.sock.sendMessage({type: type, args: args})
  },
  _message: function (message) {
    if (!message || !message.type || !Array.isArray(message.args)) {
      return console.error('Invalid message received: %s', message)
    }
    if (!this._listeners[message.type]) return
    this._listeners[message.type].forEach(function (handler) {
      handler.apply(null, message.args)
    })
  }
}
