
var expect = require('chai').expect
  , SockEmitter = require('../')
  , EventEmitter = require('events').EventEmitter
  , util = require('util')

function Mocket() {
  EventEmitter.call(this)
}

util.inherits(Mocket, EventEmitter)

Mocket.prototype.write = function (data) {
  this.emit('send:data', data)
}

Mocket.prototype.pair = function (other) {
  other.on('send:data', function (data) {
    this.emit('data', data)
  })
  this.on('send:data', function (data) {
    other.emit('data', data)
  })
}

function mockets() {
  var m1 = new Mocket()
    , m2 = new Mocket()
  m1.pair(m2)
  return [m1, m2]
}

describe('SockEmitter', function () {
  var io
    , oi
    , mocks
  beforeEach(function () {
    mocks = mockets()
    io = new SockEmitter(mocks[0])
    oi = new SockEmitter(mocks[1])
  })

  it('should send a message', function (done) {
    var message = [1,2,'hi']
    oi.on('hello', function (num, data) {
      expect(data).to.eql(message)
      expect(num).to.eql(42)
      done()
    })
    io.emit('hello', 42, message)
  })

  it('should work with wildcards', function (done) {
    var message = {one: 2, three: 'fish'}
    oi.on('one:*', function (got) {
      expect(got).to.eql(message)
      done()
    })
    io.emit('one:two', message)
  })
})
