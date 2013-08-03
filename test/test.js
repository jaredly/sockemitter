/*global it: true, describe: true, beforeEach: true */
var expect = require('chai').expect
  , SockEmitter = require('../')
  , Mocket = require('mockets')

describe('SockEmitter', function () {
  var io
    , oi
    , mocks
  beforeEach(function () {
    mocks = Mocket.pair()
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
      expect(this.event).to.equal('one:two')
      done()
    })
    io.emit('one:two', message)
  })

  it('should register an any handler', function (done) {
    var message = {one: 2, three: 'fish'}
    oi.any(function (got) {
      expect(got).to.eql(message)
      expect(this.event).to.equal('something')
      done()
    })
    io.emit('something', message)
  })
})
