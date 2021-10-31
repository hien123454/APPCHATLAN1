const Message = require("../models/Message");
const User = require("../models/User");
const addMessage = async (req, res, next) => {
  try {
    console.log("vao ham chat");
    const foundUser = await User.findOne({ _id: req.payload.userId });
    if (!foundUser){
      return res
      .status(403)
      .json({ error: { message: "User was not login!!!" } });
    }
  const {RoomId,text} = req.body;
  const savedMessage = await Message.create({ RoomId:RoomId ,text:text, sender: foundUser._id });
    res.status(200).json(savedMessage);
  } catch (err) {
    next(err)
  }
}
const cancelMessage = async (req, res, next) => {
    try {
        const message = await Message.findOne({
            _id: req.params.messageId
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
            RoomId: req.params.RoomID,
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