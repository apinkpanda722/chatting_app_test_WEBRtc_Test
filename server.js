const express = require('express');
const app = express();
const { v4: uuidV4 } = require('uuid');

const fs = require('fs');
const https = require('https');
const path = require('path');
const keyFilePath = path.resolve(
  '/home/ubuntu/chatting_app_test_WEBRtc_Test/bin',
  './privkey.pem'
);
const certFilePath = path.resolve(
  '/home/ubuntu/chatting_app_test_WEBRtc_Test/bin',
  './cert.pem'
);
const caFilePath = path.resolve(
  '/home/ubuntu/chatting_app_test_WEBRtc_Test/bin',
  './chain.pem'
);
const server = https.createServer(
  {
    key: fs.readFileSync(keyFilePath),
    cert: fs.readFileSync(certFilePath),
    ca: fs.readFileSync(caFilePath),
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
