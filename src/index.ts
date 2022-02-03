// import dotenv from "dotenv";
import server from './server';
import { getEnv } from "./enviroment";
import socketio from "socket.io";

getEnv();
// dotenv.config();
// process.env.TZ = 'America/Mexico_City';
const port = process.env.PORT;
// const mode = process.env.NODE_ENV || 'production';
// const users: any[] = [];

server.io.on("connection", async function(socket: socketio.Socket) {
    const sockets = await server.io.fetchSockets();
    console.log(sockets.length);
    // console.log(socket.handshake.query);
    // console.log(users);

    socket.on('newTurn', ({ sucursal, data }) => {
      socket.broadcast.to(sucursal).emit('newTurn', {
        turn: data
      });
    });

    socket.on('turnAttend', ({ sucursal, data }) => {
      socket.broadcast.to(sucursal).emit('turnAttend', {
        turn: data
      });
    });

    socket.on('turnFinish', ({ sucursal, data }) => {
      socket.broadcast.to(sucursal).emit('turnFinish', {
        turn: data
      });
    });

    socket.on('newTurnTest', ({ sucursal, type, data }) => {
      socket.broadcast.to(`${sucursal}-${type}`).emit('newTurnTest', {
        turn: data
      });
    });

    socket.on('attendTurnTest', ({ sucursal, type, data }) => {
      socket.broadcast.to(`${sucursal}-${type}`).emit('attendTurnTest', {
        turn: data
      });
    });

    socket.on('turnReCall', ({ sucursal, data }) => {
      socket.broadcast.to(sucursal).emit('turnReCall', {
        turn: data
      });
    });

    socket.on('join-sucursal', (sucursal) => {
      socket.join(sucursal);
    });

    socket.on('join-type', ({ sucursal, type, name, username, user }, callback) => {
      socket.join(`${sucursal}-${type}`);
      socket.broadcast.to(`${sucursal}`).emit('moduleLess', { name, username, user });
    });

    socket.on('addModule', ({ sucursal, data }) => {
      socket.broadcast.to(`${sucursal}`).emit('addModule', data);
    });

    socket.on('leave-type', ({ sucursal, type }) => {
      socket.leave(`${sucursal}-${type}`);
    });

    socket.on('leave-sucursal', ({ sucursal }) => {
      socket.leave(`${sucursal}`);
    });

    socket.on('disconnect', function () {
      console.log('A user disconnected ' + socket.id);
    });
});

server.http.listen(port, () => {
    console.log(`App Started on ${port}`);
});