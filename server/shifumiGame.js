const helper = require('./helpers.js');

module.exports = (io, socket, roomName) => {

    /**
     * Determine the winner of the game
     * @param playerChoice : string
     * @param enemyChoice : string
     * @returns {number} 0 if draw, -1 if player wins, 1 if enemy wins
     */
    const determineVictory = (playerChoice, enemyChoice) => {
        if (playerChoice === enemyChoice) {
            return 0;
        }
        if (playerChoice === 'rock' && enemyChoice === 'scissors') {
            return -1;
        }
        if (playerChoice === 'paper' && enemyChoice === 'rock') {
            return -1;
        }
        if (playerChoice === 'scissors' && enemyChoice === 'paper') {
            return -1;
        }
        return 1;
    };

    const gameEnd = (playerSocket, enemySocket) => {
        const result = determineVictory(playerSocket.choice, enemySocket.choice);
        if (result === 0) {
            //draw
            playerSocket.to(roomName).emit('result', {
                result: result,
                winnerText: 'Draw',
                choice: enemySocket.choice,
                enemyChoice: playerSocket.choice
            });
            socket.emit('result', {
                result: result,
                winnerText: 'Draw',
                choice: playerSocket.choice,
                enemyChoice: enemySocket.choice
            });
        }
        if (result === 1) { //player loses
            let resultText = enemySocket.username + ' wins ! '
            playerSocket.to(roomName).emit('result', {
                result: result * -1,
                winnerText: resultText,
                choice: enemySocket.choice,
                enemyChoice: playerSocket.choice
            });
            playerSocket.to(roomName).emit('playerWin');
            socket.emit('result', {
                result: result,
                winnerText: resultText,
                choice: playerSocket.choice,
                enemyChoice: enemySocket.choice
            });
            socket.emit('enemyWin');
        }
        if (result === -1) {
            let resultText = playerSocket.username + ' wins ! '
            //player wins
            playerSocket.to(roomName).emit('result', {
                result: result * -1,
                winnerText: resultText,
                choice: enemySocket.choice,
                enemyChoice: playerSocket.choice
            });
            playerSocket.to(roomName).emit('enemyWin');
            socket.emit('result', {
                result: result,
                winnerText: resultText,
                choice: playerSocket.choice,
                enemyChoice: enemySocket.choice
            });
            socket.emit('playerWin');
        }
        playerSocket.choice = null;
        enemySocket.choice = null;
    }

    const playerChoice = (choice) => {
        socket.choice = choice;
        let enemy = helper.getEnemySocket(io, roomName, socket.id);
        if (!enemy) {
            return;
        }
        if (enemy.choice) {
            gameEnd(socket, enemy);
        }
    }

    socket.on('playerChoice', playerChoice);
}
