const express = require("express");
const router = require("express-promise-router")();
const UsersRouter = require("./users");
const RoomsRouter = require("./rooms");
const MessageRouter = require("./messages");
router.use("/users", UsersRouter);
router.use("/rooms", RoomsRouter);
router.use("/messages", MessageRouter);

module.exports = router;