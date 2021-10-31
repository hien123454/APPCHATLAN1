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
const getRoomAfterLogin = async (req, res, next) => {
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
const getRoomByUserId = async (req, res, next) => {
  try {
      const foundUser = await User.findOne({ _id: req.payload.userId });
      if (!foundUser){
        return res
        .status(403)
        .json({ error: { message: "User was not login!!!" } });
      }
      if(foundUser._id == req.params.userId){
        const Room = await Rooms.find({
          users: { $in: [foundUser._id] },
        });
        res.status(200).json(Room);
      }
      else {
        const Room = await Rooms.find({
          users: { $in: [req.params.userId] },
        });
        res.status(200).json(Room);
      }
    } catch (err) {
      next(err)
    }
}
const getRoomById = async (req, res, next) => {
  try {
      const foundUser = await User.findOne({ _id: req.payload.userId });
      if (!foundUser){
        return res
        .status(403)
        .json({ error: { message: "User was not login!!!" } });
      }
      const roomId = req.params.RoomID;
      const Room = await Rooms.findOne({
        _id: roomId,
      });
      res.status(200).json(Room);
    } catch (err) {
      next(err)
    }
}
const getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Rooms.find({});
    res.status(200).json({ rooms });
  } catch (error) {
    next(error);
  }
}
const deleteRoom = async (req, res, next) => {
  try {
    const foundUser = await User.findOne({ _id: req.payload.userId });
    if (!foundUser){
      return res
      .status(403)
      .json({ error: { message: "User was not login!!!" } });
    }
    const roomId = req.params.RoomID;
    const Room = await Rooms.deleteOne({
      _id: roomId,
    });
    res.status(200).json({message: "Room was successfully deleted",Room});
  } catch (err) {
    next(err)
  }
}
const exitRoom = async (req, res, next) => {
  try {
    const id = req.body.id
    const foundUser = await User.findOne({ _id: req.payload.userId });
    if (!foundUser){
      return res
      .status(403)
      .json({ error: { message: "User was not login!!!" } });
    }
    await Rooms.findOneAndUpdate(
      {
        _id: id,
        users: { $in: [foundUser._id] }
      },
      {
        $pull: {
          users: { $in: [foundUser._id] }
        }
      })
    const room = await Rooms.findOne({_id:id})
    res.status(200).json({message: "exitRoom was successfully",room});
  } catch (err) {
    next(err)
  }
}
const updateRoom = async (req, res, next) => {
  try {
    const id = req.params.RoomID
    const name = req.body.name
    const foundUser = await User.findOne({ _id: req.payload.userId });
    if (!foundUser){
      return res
      .status(403)
      .json({ error: { message: "User was not login!!!" } });
    }
    await Rooms.findOneAndUpdate(
      {
        _id: id,
        users: { $in: [foundUser._id] }
      },
      {
        name: name
      }
    )
    const room = await Rooms.findOne({_id:id})
    res.status(200).json({message: "updateRoom was successfully",room});
  } catch (err) {
    next(err)
  }
}
const addMember = async (req, res, next) => {
  try {
    const id = req.body.id
    const list_user_id =req.body.list_user_id
    const foundUser = await User.findOne({ _id: req.payload.userId });
    if (!foundUser){
      return res
      .status(403)
      .json({ error: { message: "User was not login!!!" } });
    }
    await Rooms.findOneAndUpdate(
      {
        _id: id,
        users: { $in: [foundUser._id] }
      },
      {
        $addToSet: {
          users: {
            $each: list_user_id
          }
        }
      })
      const room = await Rooms.findOne({_id:id})
    res.status(200).json({message: "addMember was successfully",room});
  } catch (err) {
    next(err)
  }
}
module.exports = {
    addRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    getRoomAfterLogin,
    getRoomByUserId,
    addMember,
    exitRoom
  }