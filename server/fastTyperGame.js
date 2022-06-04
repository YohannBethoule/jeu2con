//const loremIpsum = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum';
const loremIpsum = 'lorem ipsum dolor laborum';

const helper = require('./helpers.js');

module.exports = (io, socket, roomName) => {
    const getInitialLoremIpsum = () => {
        return {
            words: loremIpsum.split(' ').map(word => {
                return {
                    word,
                    isCorrect: 0
                }
            }),
            currentWord: 0,
        };
    }

    const sendPlayerLoremIpsum = (loremIpsum) => {
        socket.emit('playerLoremIpsum', loremIpsum);
    }

    const sendEnemyLoremIpsum = (loremIpsum) => {
        socket.to(roomName).emit('enemyLoremIpsum', loremIpsum);
    }

    const playerVictory = () => {
        helper.getRoom(io, roomName).endTime = new Date().getTime();
        io.to(roomName).emit('gameLength', parseInt((helper.getRoom(io, roomName).endTime - helper.getRoom(io, roomName).startTime) / 1000));
        socket.emit('playerWin');
        socket.to(roomName).emit('enemyWin');
    }

    const checkInputValue = (index, word) => {
        if (word.length > 0) {
            if (word.trim() === loremIpsum.split(' ')[index]) {
                socket.loremIpsum.words[index].isCorrect = 1;
                if (index + 1 === socket.loremIpsum.words.length) {
                    playerVictory();
                }
                socket.loremIpsum.currentWord = index + 1;

            } else {
                socket.loremIpsum.words[index].isCorrect = -1;
            }
        } else {
            socket.loremIpsum.words[index].isCorrect = -1;
        }
        sendPlayerLoremIpsum(socket.loremIpsum);
        sendEnemyLoremIpsum(socket.loremIpsum);
    }

    socket.on('getLoremIpsum', () => {
        socket.loremIpsum = getInitialLoremIpsum();
        helper.getRoom(io, roomName).startTime = new Date().getTime();
        sendPlayerLoremIpsum(socket.loremIpsum);
        sendEnemyLoremIpsum(socket.loremIpsum);
    });

    socket.on('checkInput', checkInputValue);
}
