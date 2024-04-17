const chatModel = require('../models/chatModel');

module.exports.sendMessage = async function(data) {
    try {
        const { roomId, sender, message } = data;
        const newChatMessage = new chatModel({
            roomId,
            sender,
            message
        });
        await newChatMessage.save();
        return newChatMessage;
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        throw error;
    }
};