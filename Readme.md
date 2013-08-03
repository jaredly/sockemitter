
# SockEmitter

I wanted an EventEmitter over a network. Now I have one.

Caveat: events *only* go over the wire, not locally. So the following won't
trigger a console.log. It's possible I'll change this in the future.

```js
var io = new SockEmitter(socket)
io.on('foo', console.log)
io.emit('foo', 42)
```

## SockEmitter(socket)

### on(event, handler)
Handlers are called when an event of the specified type comes over the wire.
### off(event, handler) -> bool
Returns false if the handler wasn't found.
### emit(event, ...)
Sends the event over the wire with associated arguments. All are JSONified.
