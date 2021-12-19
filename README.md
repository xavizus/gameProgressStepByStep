# gameProgressStepByStep

Simple setup between server and client.

Client will connect to the ping-pong channel.
At client, on channel connection, the client will send a ping message on the ping-pong channel.
On server, on message on the channel ping-pong, if the message is a "ping", then respone with a pong.
At client, on message, checks if the channel is ping-pong, console.log the message.

Run: `node ./webrtc.server.js`
Visit: http://localhost:3000/index.html