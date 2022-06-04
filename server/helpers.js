exports.getEnemySocketId = (io, roomId, socketId) => {
    let enemyId = false;
    io.of("/").adapter.rooms.get(roomId).forEach(playerId => {
        if (playerId !== socketId) {
            enemyId = playerId;
        }
    });
    return enemyId;
}

exports.getEnemySocket = (io, roomId, socketId) => {
    let enemyId = this.getEnemySocketId(io, roomId, socketId);
    return io.sockets.sockets.get(enemyId);
}

exports.getRoom = (io, roomId) => {
    console.log("helper get room", roomId);
    return io.of("/").adapter.rooms.get(roomId);
}

