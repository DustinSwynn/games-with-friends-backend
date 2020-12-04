const http = require('http');
const express = require('express');
const fs = require('fs');
const socketio = require('socket.io')




const codenames = require('./src/codenames/codenames');
const setHeaders = require('./src/middlewares/setHeaders');
const codenamesRouter = require('./src/routes/codenames');
const battleshipRouter = require('./src/routes/battleship');

const loginRouter = require('./src/routes/login');

const app = express();
// const hostname = '127.0.0.1';
const port = 8080;

app.use(setHeaders);
app.use(express.json());
app.set("port", port);

app.use("/codenames", codenamesRouter);
app.use("/battleship", battleshipRouter);

const server = http.createServer(app);
const io = socketio(server)

////////////// BATTLESHIP ////////////////////////////////////
// Handle a socket connection request from web client
const connections = [null, null]

io.on('connection', socket => {
  // console.log('New WS Connection')

  // Find an available player number
  let playerIndex = -1;
  for (const i in connections) {
    if (connections[i] === null) {
      playerIndex = i
      break
    }
  }

  // Tell the connecting client what player number they are
  socket.emit('player-number', playerIndex)

  console.log(`Player ${playerIndex} has connected`)

  // Ignore player 3
  if (playerIndex === -1) return

  connections[playerIndex] = false

  // Tell eveyone what player number just connected
  socket.broadcast.emit('player-connection', playerIndex)

  // Handle Diconnect
  socket.on('disconnect', () => {
    console.log(`Player ${playerIndex} disconnected`)
    connections[playerIndex] = null
    //Tell everyone what player numbe just disconnected
    socket.broadcast.emit('player-connection', playerIndex)
  })

  // On Ready
  socket.on('player-ready', () => {
    socket.broadcast.emit('enemy-ready', playerIndex)
    connections[playerIndex] = true
  })

  // Check player connections
  socket.on('check-players', () => {
    const players = []
    for (const i in connections) {
      connections[i] === null ? players.push({connected: false, ready: false}) : players.push({connected: true, ready: connections[i]})
    }
    socket.emit('check-players', players)
  })

  // On Fire Received
  socket.on('fire', id => {
    console.log(`Shot fired from ${playerIndex}`, id)

    // Emit the move to the other player
    socket.broadcast.emit('fire', id)
  })

  // on Fire Reply
  socket.on('fire-reply', square => {
    console.log(square)

    // Forward the reply to the other player
    socket.broadcast.emit('fire-reply', square)
  })

  // Timeout connection
  setTimeout(() => {
    connections[playerIndex] = null
    socket.emit('timeout')
    socket.disconnect()
  }, 600000) // 10 minute limit per player
})
////////////////////////////////////////////////////////////////////////////////////////////////


server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  codenames.readWords();
});
