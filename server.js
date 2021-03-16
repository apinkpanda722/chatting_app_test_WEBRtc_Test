const express = require('express');
const app = express();
const { v4: uuidV4 } = require('uuid');

const fs = require('fs');
const https = require('https');
const server = https.createServer(
  {
    key: fs.readFileSync(
      '/etc/letsencrypt/live/www.shadow-fit.com/privkey.pem'
    ),
    cert: fs.readFileSync('/etc/letsencrypt/live/www.shadow-fit.com/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/www.shadow-fit.com/chain.pem'),
    requestCert: false,
    rejectUnauthorized: false,
  },
  app
);

const io = require('socket.io')(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });
});

server.listen(3000);
