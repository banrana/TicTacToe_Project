var gameModel = require('../models/gameModel');
const config = require('../configs/config');

// function checkWinner(board) {
//     for (let i = 0; i < 3; i++) {
//         if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][0] !== '') {
//             return board[i][0];
//         }
//         if (board[0][i] === board[1][i] && board[1][i] === board[2][i] && board[0][i] !== '') {
//             return board[0][i];
//         }
//     }

//     if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== '') {
//         return board[0][0];
//     }
//     if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[0][2] !== '') {
//         return board[0][2];
//     }
//     return null;
// }
function checkCellWin(board, row, col, maxRow, maxCol, winLength) {
    let maxLength, rowMove, colMove;
    let player = board[row][col];

    //column
    rowMove=row-1;
    maxLength=1;
    //left
    while(rowMove>=0&&board[rowMove][col]==player){
        maxLength++;
        rowMove--;
    }
    //right
    rowMove=row+1;
    while(rowMove<maxRow&&board[rowMove][col]==player){
        maxLength++;
        rowMove++;
    }
    if(maxLength>=winLength)return true;

    //row
    colMove=col-1;
    maxLength=1;
    //up
    while(colMove>=0&&board[row][colMove]==player){
        maxLength++;
        colMove--;
    }
    //down
    colMove=col+1;
    while(colMove<maxCol&&board[row][colMove]==player){
        maxLength++;
        colMove++;
    }
    if(maxLength>=winLength)return true;

    //diagonal
    rowMove=row-1;
    colMove=col-1;
    maxLength=1;
    //up-left
    while(rowMove>=0&&colMove>=0&&board[rowMove][colMove]==player){
        maxLength++;
        rowMove--;
        colMove--;
    }
    //down-right
    rowMove=row+1;
    colMove=col+1;
    while(rowMove<maxRow&&colMove<maxCol&&board[rowMove][colMove]==player){
        maxLength++;
        rowMove++;
        colMove++;
    }
    if(maxLength>=winLength)return true;
    //up-right
    maxLength=1;
    rowMove=row-1;
    colMove=col+1;
    while(rowMove>=0&&colMove<maxCol&&board[rowMove][colMove]==player){
        maxLength++;
        rowMove--;
        colMove++;
    }
    //down-left
    maxLength=1;
    rowMove=row+1;
    colMove=col-1;
    while(rowMove<maxRow&&colMove>=0&&board[rowMove][colMove]==player){
        maxLength++;
        rowMove++;
        colMove--;
    }
    if(maxLength>=winLength)return true;
    return false;
}
function checkWinner(board) {
    const BOARD_ROW = config.BOARD_ROWS;
    const BOARD_COL = config.BOARD_COLS;
    const WIN_LENGTH = config.WIN_LENGTH;
    console.log(board);
    for (let i = 0; i < BOARD_ROW; i++) {
        for(let j = 0; j < BOARD_COL; j++){
            console.log(board[i][j]);
            if(board[i][j]!=''&&checkCellWin(board,i,j,BOARD_ROW,BOARD_COL,WIN_LENGTH)){
                console.log(i+" "+j);
                return board[i][j];
            }
        }
    }
    return null;
}

module.exports.move = async function(data) {
    try {
        // console.log(data);
        const { gameId, player, row, col } = data;
        const game = await gameModel.findOne({ _id: gameId });
        // const move = `(${row},${col})`;
        let board = JSON.parse(game.board);
        board[row][col] = player;
        const winner = checkWinner(board);
        let moves = JSON.parse(game.moves);
        moves.push({userId: player, row: row, col: col});
        if (winner) {
            // console.log(board);
            // console.log(winner);
            game.winner = winner;
            game.finishedAt = new Date();
        }
        game.moves = JSON.stringify(moves);
        game.board = JSON.stringify(board);
        await game.save();
        return winner;
    } catch (error) {
        console.error("Lỗi khi thêm nước đi:", error);
    }
};