const crypto = require('crypto');
const Table = require('cli-table3');

const MESSAGES = {
    howToWin: "You can win by selecting moves that defeat the opponent. Ex: Rock crushes Scissors.",
    InvalidArguments: "Invalid arguments. Please provide an odd number of non-repeating strings. Ex: rock paper scissors lizard spock.",
    InvalidInput: "Invalid input. choose from the menu!",
}

class MoveTable {
    constructor(moves) {
        this.moves = moves;
        this.table = this.generateTable();
    }

    generateTable() {
        const n = this.moves.length;
        const table = new Array(n).fill(null).map(() => new Array(n).fill('Draw'));

        for (let i = 0; i < n; i++) {
            const half = Math.floor((n - 1) / 2);
            for (let j = 1; j <= half; j++) {
                table[i][(i + j) % n] = 'Win';
                table[(i + j) % n][i] = 'Lose';
            }
        }

        return table;
    }

    printTable() {
        const headers = ['v PC\\Player >', ...this.moves];
        const table = new Table({ head: headers, style: { head: ['green'], border: 2 } });

        this.moves.forEach((move, index) => {
            const row = [move, ...this.table[index]];
            table.push(row);
        });

        console.log(table.toString());
    }

    printExampleWin() {
        console.log(MESSAGES.howToWin);
    }
}

class RockPaperScissorsGame {
    constructor(moves) {
        this.moves = moves;
        this.key = this.generateRandomKey();
        this.computerMove = this.moves[Math.floor(Math.random() * this.moves.length)];
    }

    generateRandomKey() {
        const keyLength = 32; 
        const randomKey = crypto.randomBytes(keyLength / 2).toString('hex');
        return randomKey;
    }

    computeHmac(move) {
        const hmac = crypto.createHmac('sha256', Buffer.from(this.key, 'hex'));
        hmac.update(move);
        return hmac.digest('hex');
    }

    printMenu() {
        console.log('HMAC:', this.computeHmac(this.computerMove));
        console.log('Available moves:');
        this.moves.forEach((move, index) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log('0 - exit');
        console.log('? - help');
    }

    checkWinner(userMove) {
        const n = this.moves.length;
        const userIndex = parseInt(userMove) - 1;
        const compIndex = this.moves.indexOf(this.computerMove);

        if (userIndex === compIndex) {
            return 'Draw';
        }

        if ((compIndex - userIndex + n) % n > Math.floor(n / 2)) {
            return 'Win';
        }

        return 'Lose';
    }

    play() {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        readline.question('Enter your move: ', (userMove) => {
            if (userMove === '0') {
                readline.close();
                return;
            } else if (userMove === '?') {
                const table = new MoveTable(this.moves);
                table.printExampleWin();
                table.printTable();
                readline.close();
            } else if (userMove.match(/^\d+$/) && parseInt(userMove) >= 1 && parseInt(userMove) <= this.moves.length) {
                const userIndex = parseInt(userMove) - 1;
                const userMoveStr = this.moves[userIndex];
                const result = this.checkWinner(userMove);
                console.log(`Your move: ${userMoveStr}`);
                console.log(`Computer move: ${this.computerMove}`);
                console.log(`You ${result}!`);
                console.log(`HMAC key: ${this.key}`);
                readline.close();
            } else {
                console.log(MESSAGES.InvalidInput);
                readline.close();
            }
        });
    }
}

if (process.argv.length < 4 || process.argv.length % 2 === 0 || new Set(process.argv.slice(2)).size !== process.argv.length - 2) {
    console.log(MESSAGES.InvalidArguments);
} else {
    const moves = process.argv.slice(2);
    const game = new RockPaperScissorsGame(moves);
    game.printMenu();
    game.play();
}
