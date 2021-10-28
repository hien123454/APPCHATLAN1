const Message = require("../models/Message");
const express = require("express");
// const router = express.Router()
const router = require("express-promise-router")();
const { verifyAccessToken } = require("../helpers/jwt.service");
const MessageController = require("../controllers/message");
//add

router.post("/addMessage",verifyAccessToken,MessageController.addMessage);

router.get("/cancelMessage",verifyAccessToken,MessageController.cancelMessage);
//get
router.get("/getMessage",verifyAccessToken,MessageController.getMessage);
module.exports = router;
