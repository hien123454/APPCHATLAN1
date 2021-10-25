const bcrypt = require("bcryptjs");
const User = require("../models/User");
const UserRequest = require("../models/UserRequest");
const client = require("../helpers/connect_redis");
const Rooms = require("../models/Rooms");
const FilterUserData = require("../utils/FilterUserData");
const { sendSmsOTP, verifyOtp } = require("../services/phone.service");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt.service");

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
const signIn = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res
        .status(403)
        .json({ error: { message: "User not registered." } });
    }
    const isValid = await user.isValidPassword(password);
    if (!isValid) {
      return res.status(403).json({ error: { message: "Unauthorized !!!" } });
    }
    user.active = true;
    await user.save();
    const accessToken = await signAccessToken(user._id);
    const refreshToken = await signRefreshToken(user._id);
    res.setHeader("authorization", accessToken);
    res.setHeader("refreshToken", refreshToken);

    return res.status(200).json({ success: true, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
  // Assign a token
};
const signUp = async (req, res, next) => {
  try {
    const { username, phone, password } = req.value.body;
    // Check if there is a user with the same user
    const foundUser = await User.findOne({ phone });
    if (foundUser)
      return res
        .status(403)
        .json({ error: { message: "Phone is already in use." } });
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Generate a password hash (salt + hash)
    const passwordHashed = await bcrypt.hash(password, salt);
    // Re-assign password hashed
    const newPassword = passwordHashed;
    // Create a new user
    const newUser = await User.create({
      username,
      phone,
      password: newPassword,
    });

    return res.status(201).json({ success: true, newUser });
  } catch (error) {
    next(error);
  }
};
const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.headers["refreshtoken"];
    console.log(req.headers);
    if (!refreshToken) {
      return res.status(401).json({ message: "bad request" });
    }
    const { userId } = await verifyRefreshToken(refreshToken);
    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId);
    return res.status(200).json({ accessToken, refToken });
  } catch (error) {
    next(error);
  }
};
const Logout = async (req, res, next) => {
  try {
    const refreshToken = req.headers["refreshtoken"];
    console.log(req.headers);
    if (!refreshToken) {
      return res.status(401).json({ message: "bad request" });
    }
    const { userId } = await verifyRefreshToken(refreshToken);
    const user = await User.findById(userId);
    user.active = false;
    await user.save();
    client.del(userId.toString(), (err, reply) => {
      if (err) return res.status(500).json({ message: "bad request" });
      return res.status(200).json({ message: "Logout !!!!" });
    });
  } catch (error) {
    next(error);
  }
};
const ChangePassword = async (req, res, next) => {
  try {
    const { password, reEnterPassword, newPassword } = req.body;
    console.log(req.payload);
    // Check if there is a user with the same user
    const foundUser = await User.findOne({ _id: req.payload.userId });
    if (!foundUser)
      return res
        .status(403)
        .json({ error: { message: "User was not login!!!" } });
    //Check password co ton tai khong
    const isValid = await foundUser.isValidPassword(password);
    if (!isValid) {
      return res.status(403).json({ error: { message: "Unauthorized" } });
    }
    //Check password co giong khong
    if (password !== reEnterPassword) {
      return res
        .status(403)
        .json({ error: { message: "Password Nhap Sai!!!" } });
    }
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Generate a password hash (salt + hash)
    const passwordHashed = await bcrypt.hash(newPassword, salt);
    // Re-assign password hashed
    const newChangePassword = passwordHashed;
    //Change Password
    foundUser.password = newChangePassword;
    await foundUser.save();
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
const forgotPassword = async (req, res, next) => {
  try {
    const { phone, code, Password, reEnterPassword } = req.body;
    if (Password !== reEnterPassword) {
      return res
        .status(403)
        .send([{ message: "Password and reEnterpassword must be the same " }]);
    }
    const result = await verifyOtp(phone, code);
    if (result) {
      const FoundUser = await User.findOne({ phone });
      // Generate a salt
      const salt = await bcrypt.genSalt(10);
      // Generate a password hash (salt + hash)
      const passwordHashed = await bcrypt.hash(Password, salt);
      // Re-assign password hashed
      const newChangePassword = passwordHashed;
      //Change Password
      FoundUser.password = newChangePassword;
      await FoundUser.save();
      res
        .status(200)
        .send([{ message: "Password has been updated ", FoundUser }]);
    } else {
      res.status(400).send([
        {
          msg: "Code is used or expired",
          param: "otp",
        },
      ]);
    }
  } catch (error) {
    next(error);
  }
};
const sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await sendSmsOTP(phone);
    if (result !== true) {
      res.status(500).json([
        {
          msg: "Send SMS Failed",
          param: "sms",
        },
      ]);
    } else {
      res.status(201).json({
        message: "Send SMS successfully",
      });
    }
  } catch (error) {
    next(error);
  }
};
const verifyOTPSignUp = async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    const result = await verifyOtp(phone, code);
    console.log(result);
    if (result) {
      res.status(200).send("Check code successfully");
    } else {
      res.status(400).send([
        {
          msg: "Code is used or expired",
          param: "otp",
        },
      ]);
    }
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
  signUp,
  signIn,
  Logout,
  refreshToken,
  requestAddFriend,
  cancelSendedFriend,
  acceptFriend,
  declineFriend,
  ChangePassword,
  forgotPassword,
  sendOTP,
  verifyOTPSignUp,
};
