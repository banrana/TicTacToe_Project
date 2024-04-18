var express = require('express');
var router = express.Router();
var roomModel = require('../models/roomModel');
var gameModel = require('../models/gameModel');
const chatService = require('../socket/chat.service');
var protect = require('../middlewares/protect');
const config = require('../configs/config');

// GET /game/create
router.get('/create', protect, async function (req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).send("Bạn cần đăng nhập để tạo phòng.");
        }
        const userId = req.user._id;
        const roomname = req.query.roomname;
        if (!roomname) {
            return res.status(400).send("Vui lòng nhập tên phòng.");
        }
        const newRoom = new roomModel({
            roomname: roomname,
            createdBy: userId,
            players: [userId],
            gameStarted: false,
            gameEnded: false
        });
        const savedRoom = await newRoom.save();
        if (savedRoom) {
            let board = [];

            for (let i = 0; i < config.BOARD_ROWS; i++) {
                board[i] = [];
                for (let j = 0; j < config.BOARD_ROWS; j++) {
                    board[i][j] = "";
                }
            }
            const newGame = new gameModel({
                roomId: savedRoom._id,
                board: JSON.stringify(board),
                moves: JSON.stringify([])

            });
            let saveGame = await newGame.save();
            res.redirect('/game/play?gameId=' + saveGame._id);
        } else {

            throw new Exception("Couldn't create game");
        }
    } catch (error) {
        console.error("Lỗi khi tạo phòng:", error);
        res.status(500).send("Đã xảy ra lỗi khi tạo phòng.");
    }
});

router.get('/join', protect, async function (req, res, next) {
    try {
        console.log("Received a move request");
        const roomname = req.query.roomname;
        if (!roomname) {
            return res.status(400).send("Vui lòng nhập tên phòng.");
        }
        const existingRoom = await roomModel.findOne({ roomname: roomname });
        if (!existingRoom) {
            return res.status(404).send("Không tìm thấy phòng.");
        }
        if (!req.user) {
            return res.status(401).send("Bạn cần đăng nhập để tham gia phòng.");
        }
        const existingGame = await gameModel.findOne({ roomId: existingRoom._id });
        const userId = req.user._id;
        if (existingRoom.players.includes(userId)) {
            return res.redirect('/game/play?gameId=' + existingGame._id);
        }
        existingRoom.players.push(userId);
        await existingRoom.save();
        res.redirect('/game/play?gameId=' + existingGame._id);
    } catch (error) {
        console.error("Lỗi khi tham gia phòng:", error);
        res.status(500).send("Đã xảy ra lỗi khi tham gia phòng.");
    }
});

router.get('/play', protect, async function (req, res, next) {
    const gameId = req.query.gameId;
    const userId = req.user._id;
    res.render('game', { gameId: gameId, userId: userId });

});

router.get('/', async function (req, res, next) {
    try {
        let limit = parseInt(req.query.limit) || 5;
        let page = parseInt(req.query.page) || 1;
        const games = await gameModel.find({})
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async function (req, res, next) {
    try {
        const game = await gameModel.findById(req.params.id).exec();

        if (!game) {
            return res.status(404).json({ message: 'Không tìm thấy trò chơi' });
        }

        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/findbyroom/:roomId', async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const game = await gameModel.findOne({ roomId }).exec();
        if (!game) {
            return res.status(404).json({ message: 'Không tìm thấy trò chơi với roomId cung cấp' });
        }
        return res.status(200).json(game);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post('/', async function (req, res, next) {
    try {
        const newGame = new gameModel({
            roomId: req.body.roomId,
            moves: req.body.moves || [],
            board: req.body.board || '',
            winner: req.body.winner || null,
            finishedAt: req.body.finishedAt || null
        });

        const savedGame = await newGame.save();

        res.status(201).json(savedGame);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', async function (req, res, next) {
    try {
        const updatedGame = await gameModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();

        res.status(200).json(updatedGame);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', async function (req, res, next) {
    try {
        const deletedGame = await gameModel.findByIdAndDelete(req.params.id).exec();

        res.status(200).json(deletedGame);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// router.post('/move', protect, async function(req, res, next) {
//     try {
//         const { roomId, player, row, col } = req.body;
//         const game = await gameModel.findOne({ roomId: roomId });
//         const move = `(${row},${col})`;
//         const winner = checkWinner(game.moves);
//         if (winner) {
//             game.winner = winner;
//             game.finishedAt = new Date();
//         }
//         await game.save();
//         io.emit('move', { roomId: roomId, player: player, move: move });

//         res.status(200).send("Nước đi đã được lưu.");
//     } catch (error) {
//         console.error("Lỗi khi thêm nước đi:", error);
//         res.status(500).send("Đã xảy ra lỗi khi thêm nước đi.");
//     }
// });

module.exports = router;