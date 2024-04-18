var express = require('express');
var router = express.Router();
var roomModel = require('../models/roomModel');

router.get('/', async function (req, res, next) {
    try {
        let limit = parseInt(req.query.limit) || 5;
        let page = parseInt(req.query.page) || 1;

        const rooms = await roomModel.find({})
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async function (req, res, next) {
    try {
        const room = await roomModel.findById(req.params.id).exec();

        if (!room) {
            return res.status(404).json({ message: 'Không tìm thấy phòng' });
        }

        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/findbyname/:roomname', async function (req, res, next) {
    try {
        const roomname = req.params.roomname;
        const room = await roomModel.findOne({ roomname }).exec();

        if (!room) {
            return res.status(404).json({ message: 'Không tìm thấy phòng' });
        }

        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async function (req, res, next) {
    try {
        const newRoom = new roomModel({
            roomname: req.body.roomname,
            createdBy: req.body.createdBy,
            players: req.body.players || []
        });

        const savedRoom = await newRoom.save();

        res.status(201).json(savedRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', async function (req, res, next) {
    try {
        const updatedRoom = await roomModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();

        res.status(200).json(updatedRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', async function (req, res, next) {
    try {
        const deletedRoom = await roomModel.findByIdAndDelete(req.params.id).exec();

        res.status(200).json(deletedRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
