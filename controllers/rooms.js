const User = require("../models/User");
const Rooms = require("../models/Rooms");

const addRoom = async (req, res, next) => {
    try {
        const foundUser = await User.findOne({ _id: req.payload.userId });
        if (!foundUser){
          return res
          .status(403)
          .json({ error: { message: "User was not login!!!" } });
        }
        const name = req.body.NameGroup
        const users = req.body.ListUsers
        users.push(foundUser._id);
        const newRoom = new Rooms({
          name,
          users,
          group: true,
        });
        const saveRoom = await newRoom.save();
        res.status(200).json(saveRoom);
      } catch (err) {
        next(err)
      }
}
const getListRoom = async (req, res, next) => {
    try {
        const foundUser = await User.findOne({ _id: req.payload.userId });
        if (!foundUser){
          return res
          .status(403)
          .json({ error: { message: "User was not login!!!" } });
        }
        const Room = await Rooms.find({
          users: { $in: [foundUser._id] },
        });
        res.status(200).json(Room);
      } catch (err) {
        next(err)
      }
}

module.exports = {
    addRoom,
    getListRoom}