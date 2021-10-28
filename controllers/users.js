const User = require("../models/User");
const UserRequest = require("../models/UserRequest");
const Rooms = require("../models/Rooms");
const FilterUserData = require("../utils/FilterUserData");

const index = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};
const newUser = async (req, res, next) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(200).json({ newUser });
  } catch (error) {
    next(error);
  }
};
const getUser = async (req, res, next) => {
  try {
    const id = req.params.userId;
    const users = await User.findById({ _id: id }).populate("username");
    //const friend = await FriendRequest.findById(save.id).populate('receiver')

    const chunkData = {
      id: users.id,
      user: FilterUserData(users.username),
    };
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};
const updateUser = async (req, res, next) => {
  try {
    const id = req.params.userId;
    const newUser = req.body;
    const result = await User.findByIdAndUpdate(id, newUser);
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
const replaceUser = async (req, res, next) => {
  try {
    const id = req.params.userId;
    const newUser = req.body;
    const result = await User.findByIdAndUpdate(id, newUser);
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
const requestAddFriend = async (req, res, next) => {
  try {
    const foundUser = await User.findOne({ _id: req.payload.userId });
    const { id_UserWantAdd } = req.body;
    if (!foundUser)
      return res
        .status(403)
        .json({ error: { message: "User was not login!!!" } });
    if (foundUser._id === id_UserWantAdd) {
      return res
        .status(400)
        .json({ error: "You cannot send friend request to yourself" });
    }
    if (foundUser.friends.includes(id_UserWantAdd)) {
      return res.status(400).json({ error: "Already Friends" });
    }
    const friendRequest = await UserRequest.findOne({
      sender: foundUser._id,
      receiver: id_UserWantAdd,
    });
    if (friendRequest) {
      return res.status(400).json({ error: "Friend Request already send" });
    }
    const newFriendRequest = new UserRequest({
      sender: foundUser._id,
      receiver: id_UserWantAdd,
    });
    const save = await newFriendRequest.save();
    const friend = await UserRequest.findById(save.id).populate("receiver");
    console.log(friend);
    const chunkData = {
      id: friend.id,
      user: FilterUserData(friend.receiver),
    };
    res
      .status(200)
      .json({ message: "Friend Request Sended", friend: chunkData });
  } catch (error) {
    next(error);
  }
};
const cancelSendedFriend = async (req, res, next) => {
  try {
    const friendsRequest = await UserRequest.findById(
      req.body.requestId
    ).populate("receiver");
    if (!friendsRequest) {
      return res
        .status(404)
        .json({ error: "Request already cenceled or not sended yet" });
    }
    await UserRequest.deleteOne({ _id: req.body.requestId });

    res.status(200).json({ message: "Friend Request Canceled" });
  } catch (error) {
    next(error);
  }
};
const acceptFriend = async (req, res, next) => {
  try {
    const friendsRequest = await UserRequest.findById(req.body.requestId);
    if (!friendsRequest) {
      return res
        .status(404)
        .json({ error: "Request already accepted or not sended yet" });
    }
    const sender = await User.findById(friendsRequest.sender);
    if (sender.friends.includes(friendsRequest.receiver)) {
      return res.status(400).json({ error: "already in your friend lists" });
    }
    sender.friends.push(req.payload.userId);
    await sender.save();
    const currentUser = await User.findById(req.payload.userId);
    if (currentUser.friends.includes(friendsRequest.sender)) {
      return res.status(400).json({ error: "already  friend " });
    }
    currentUser.friends.push(friendsRequest.sender);
    await currentUser.save();
    const chunkData = FilterUserData(sender);
    await UserRequest.deleteOne({ _id: req.body.requestId });
    const listUsers = [currentUser._id, sender._id];
    const room = await Rooms.create({ users: listUsers, group: false });
    res
      .status(200)
      .json({ message: "Friend Request Accepted", user: chunkData });
  } catch (error) {
    next(error);
  }
};
const declineFriend = async (req, res, next) => {
  try {
    const friendsRequest = await UserRequest.findById(
      req.body.requestId
    ).populate("sender");
    if (!friendsRequest) {
      return res
        .status(404)
        .json({ error: "Request already declined or not sended yet" });
    }
    await UserRequest.deleteOne({ _id: req.body.requestId });

    res.status(200).json({ message: "Friend Request Declined" });
  } catch (error) {
    next(error);
  }
};
const GetUserAfterLogin = async (req, res, next) => {
  try {
    const foundUser = await User.findOne({ _id: req.payload.userId });
    if (!foundUser){
      return res
      .status(403)
      .json({ error: { message: "User was not login!!!" } });
    }
      res.status(200).send({foundUser});
  } catch (error) {
    next(error);
  }
};
module.exports = {
  index,
  newUser,
  getUser,
  updateUser,
  replaceUser,
  requestAddFriend,
  cancelSendedFriend,
  acceptFriend,
  declineFriend,
  GetUserAfterLogin
};
