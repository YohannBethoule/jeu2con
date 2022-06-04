const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const {Server} = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const registrerRoomHandlers = require("./roomManagement");

app.use(cors());


io.on('connection', (socket) => {
    registrerRoomHandlers(io, socket);


    console.log(socket.username + ' connected')
    socket.on('disconnect', () => {
        console.log('user disconnected');

    });
    socket.on('message', (message) => {
        console.log('Message received : ' + message);
        io.emit('message', message);
    });
    socket.on('ennemyPosition', (position) => {
        console.log('Message received : ' + position);
        io.emit('ennemyPosition', position);
    });

    //used for dev debug
    socket.onAny((event, ...args) => {
        console.log(event, args);
    });
});


server.listen(3001, () => {
    console.log('listening on *:3001');
});
