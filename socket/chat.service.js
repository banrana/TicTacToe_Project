const chatModel = require('../models/chatModel');
const userModel = require('../models/userModel');

module.exports.sendMessage = async function(data) {
    try {
        const { roomId, sender, message } = data;
        const senderInfo = await userModel.findById(sender);
        const newChatMessage = new chatModel({
            roomId,
            sender,
            message
        });
        await newChatMessage.save();
        return {
            sender: senderInfo ? senderInfo.username : "Unknown",
            message: message
        };
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        throw error;
    }
};