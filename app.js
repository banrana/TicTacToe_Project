const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/tictactoe').then(
  function () {
    console.log("connected");
  }
).catch(function (err) {
  console.log(err);
});

const players = {};
const gameService = require('./socket/game.service');
const chatService = require('./socket/chat.service');

io.on('connection', (socket) => {
  console.log('A client connected');
  socket.on('joinGame', (playerId) => {
    players[socket.id] = playerId;
    console.log('Player ' + playerId + ' joined the game');
  });
  socket.on('move', async (data) => {
    let winner = await gameService.move(data);
    if (winner != null) {
      data.winner = winner;
    }
    socket.broadcast.emit('move', data);
    console.log(data);
  });

  socket.on('joinRoomChat', async (data) => {
    console.log(data);
    socket.join(data.roomId);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const chatMessage = await chatService.sendMessage(data);
      io.to(data.roomId).emit('receiveMessage', chatMessage);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    console.log('A client disconnected');
  });
});

app.use('/', require('./routes/routes'));
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.send({
    success: false,
    data: err.message
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
