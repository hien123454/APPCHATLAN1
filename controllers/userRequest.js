const User = require("../models/User");
const UserRequest = require("../models/UserRequest");
const FilterUserData = require("../utils/FilterUserData");

const getListSenderRequest = async (req, res, next) => {
    try {
        const foundUser = await User.findOne({ _id: req.payload.userId });
        if (!foundUser){
          return res
          .status(403)
          .json({ error: { message: "User was not login!!!" } });
        }
        const userRequest = await UserRequest.find({
            sender: foundUser._id,
        });
        res.status(200).json(userRequest);
      } catch (err) {
        next(err)
      }
}

const getListReceiver = async (req, res, next) =>{
    try {
        const foundUser = await User.findOne({ _id: req.payload.userId });
        if (!foundUser){
          return res
          .status(403)
          .json({ error: { message: "User was not login!!!" } });
        }
        const userRequest = await UserRequest.find({
            receiver: foundUser._id,
        });
        res.status(200).json(userRequest);
      } catch (err) {
        next(err)
      }
}

module.exports = {
    getListSenderRequest,
    getListReceiver
}