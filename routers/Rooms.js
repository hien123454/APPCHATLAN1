const Rooms = require("../models/Rooms");
const express = require("express");
// const router = express.Router()
const router = require("express-promise-router")();
const { verifyAccessToken } = require("../helpers/jwt.service");
const RoomController = require("../controllers/rooms");
//new conv

router.post("/addRoom",verifyAccessToken,RoomController.addRoom);
//get conv of a user
router.get("/getRoom",verifyAccessToken,RoomController.getRoom);

router.get("/getListRoom",verifyAccessToken,RoomController.getListRoom);

module.exports = router;
