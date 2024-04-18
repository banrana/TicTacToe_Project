var express = require('express');
var router = express.Router();
var chatModel = require('../models/chatModel');

router.get('/:roomId', async function (req, res, next) {
  try {
    const roomId = req.params.roomId;
    const messages = await chatModel.find({ roomId }).exec();
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async function (req, res, next) {
  try {
    const { roomId, sender, message } = req.body;
    
    const newMessage = new chatModel({
      roomId,
      sender,
      message
    });
    
    const savedMessage = await newMessage.save();
    
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
