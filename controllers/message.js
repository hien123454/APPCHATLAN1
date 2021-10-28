const Message = require("../models/Message");

const addMessage = async (req, res, next) => {
  try {
  const {RoomId,sender,text} = req.body;
  console.log(RoomId,sender,text);
  const savedMessage = await Message.create({ RoomId:RoomId ,text:text, sender: sender });
    res.status(200).json(savedMessage);
  } catch (err) {
    next(err)
  }
}
const cancelMessage = async (req, res, next) => {
    try {
        const message = await Message.findOne({
            _id: req.body.MessageId
        });
        message.active = false;
        await message.save();
        res.status(200).json(message);
      } catch (err) {
        next(err)
      }
}
const getMessage = async (req, res, next) => {
    try {
        const messages = await Message.find({
            RoomId: req.body.RoomId,
        });
        res.status(200).json(messages);
      } catch (err) {
        next(err)
      }
}

module.exports = {
    addMessage,
    cancelMessage,
    getMessage}