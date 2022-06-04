const registerFastTyperHandlers = require("./fastTyperGame");
const registerShifumiHandlers = require("./shifumiGame");
const helper = require("./helpers");

module.exports = (io, socket) => {
    const getEnemySocketId = (roomId, socketId) => {
        let enemyId = false;
        io.of("/").adapter.rooms.get(roomId).forEach(playerId => {
            if (playerId !== socketId) {
                enemyId = playerId;
            }
        });
        return enemyId;
    }

    const getGameRooms = () => {
        let rooms = [];
        console.log('getGameRooms', io.of("/").adapter.rooms);
        io.of("/").adapter.rooms.forEach((value, key) => {
            if (key.startsWith('game-')) {
                rooms.push(key);
            }
        });
        return rooms;
    }

    const newRoom = () => {
        let roomId = getGameRooms().length;
        while (helper.getRoom(io, 'game-' + roomId)) {
            roomId++
        }
        socket.emit('newRoom', 'game-' + roomId);
    }

    const joinRoom = (roomName, gameType) => {
        console.log("joinRoom", roomName);

        const rooms = io.of("/").adapter.rooms;
        //If the room already exists
        if (rooms.get(roomName)) {
            //If the room already holds 2 players
            if (rooms.get(roomName).size === 2) {
                console.log(roomName + ' was full');
                socket.emit('roomIsAlreadyFull', {errors: [{code: 1, message: "Room was already full."}]});
                return;
            }
        }
        socket.join(roomName);
        socket.username = 'Player ' + rooms.get(roomName).size;
        getGameRooms();
        const room = io.of("/").adapter.rooms.get(roomName);
        if (gameType) {
            room.gameType = gameType;
        }
        if (room.gameType === 'loremIpsum') {
            registerFastTyperHandlers(io, socket, roomName);
        }
        if (room.gameType === 'shifumi') {
            console.log('registerShifumiHandlers');
            registerShifumiHandlers(io, socket, roomName);
        }
        if (room.size === 2) {
            const enemySocketId = getEnemySocketId(roomName, socket.id);
            socket.to(roomName).emit('enemyName', socket.username);
            if (enemySocketId) {
                io.to(socket.id).emit('enemyName', io.sockets.sockets.get(enemySocketId).username)
            }
        }
        io.to(socket.id).emit('ownName', socket.username)
        //console.log('rooms', rooms);
        io.emit('roomJoined', roomName, room.gameType);
    }

    const leaveRoom = (roomName) => {
        socket.leave(roomName);
    }

    const readyPlayerState = (roomName, state) => {
        socket.ready = state;
        socket.to(roomName).emit('enemyReadyState', state);
        let bothReady = true;
        io.of("/").adapter.rooms.get(roomName).forEach(playerId => {
            if (!io.sockets.sockets.get(playerId).ready) {
                bothReady = false;
            }
        })
        if (bothReady) {
            let message = 3;
            let timer = 0;
            while (timer < 4 * 1000) {
                setTimeout(function () {
                    if (message > 0) {
                        io.to(roomName).emit('gameStarting', message--);
                    } else {
                        io.to(roomName).emit('gameStart');
                    }
                }, timer);
                timer += 1000;
            }
        }
    }

    socket.on('newRoom', newRoom);
    socket.on('joinRoom', joinRoom);
    socket.on('playerReadyState', readyPlayerState);
    socket.on('leaveRoom', leaveRoom);

    io.of("/").adapter.on("leave-room", (roomId, socketId) => {
        console.log(`socket ${socketId} has left room ${roomId}`);
        const room = io.of("/").adapter.rooms.get(roomId);
        if (!room) return;
        if (room.size === 1) {
            if (room.gameStarted) {
                console.log('User left after game started');
                io.to(roomId).emit('enemyLeft');
            } else {
                console.log('User left before game started');
                io.to(roomId).emit('enemyLeft');
            }
        }
        if (room.size === 0) {
            io.of("/").adapter.rooms.delete(roomId);
        }
    });

    io.of("/").adapter.on("create-room", (room) => {
        console.log(`room ${room} was created`);
    });

    io.of("/").adapter.on("join-room", (roomId, socketId) => {

    });
}
