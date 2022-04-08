import express from 'express';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';

import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import bindRoutes from './routes.mjs';

const io = new Server(3000, {
  cors: {
    origin: ['http://localhost:3004', 'https://admin.socket.io', 'https://mysterious-garden-35921.herokuapp.com'],
  },
});

io.on('connection', (socket) => {
  socket.on('join-socket', (roomNum) => {
    socket.join(roomNum);
    socket.to(roomNum).emit('enableStartButton');
    socket.leave('lobby');
  });

  socket.on('leave-socket', (roomNum) => {
    socket.leave(roomNum);
    socket.join('lobby');
  });

  socket.on('readyToStart', (roomNum) => {
    socket.to(roomNum).emit('readyToStart');
  });

  socket.on('refreshRoom', (roomNum) => {
    socket.to(roomNum).emit('refreshRoom');
  });

  socket.on('refreshGame', (roomNum) => {
    socket.to(roomNum).emit('refreshGame');
  });

  socket.on('update-game-list', () => {
    socket.to('lobby').emit('update-game-list');
  });

  socket.on('join-lobby', () => {
    socket.join('lobby');
    socket.to('lobby').emit('update-game-list');
  });

  socket.on('room-ready', (roomNum) => {
    io.in(roomNum).emit('room-ready');
  });

  socket.on('loadout-ready', (roomNum) => {
    io.in(roomNum).emit('loadout-ready');
  });

  socket.on('advance-inner-gamestate', (roomNum) => {
    io.in(roomNum).emit('advance-inner-gamestate', roomNum);
  });
});

instrument(io, { auth: false });

// Initialise Express instance
const app = express();
// Set the Express view engine to expect EJS templates
app.set('view engine', 'ejs');
// Bind cookie parser middleware to parse cookies in requests
app.use(cookieParser());
// Bind Express middleware to parse request bodies for POST requests
app.use(express.urlencoded({ extended: false }));
// Bind Express middleware to parse JSON request bodies
app.use(express.json());
// Bind method override middleware to parse PUT and DELETE requests sent as POST requests
app.use(methodOverride('_method'));
// Expose the files stored in the public folder
app.use(express.static('public'));
// Expose the files stored in the distribution folder
app.use(express.static('dist'));

// Bind route definitions to the Express application
bindRoutes(app);

// Set Express to listen on the given port
const PORT = process.env.PORT || 3004;
app.listen(PORT);
