const router = require("express").Router();
const Rooms = require("../models/Rooms");

//new conv

router.post("/", async (req, res) => {
  const newRoom = new Rooms({
    users: [req.body.senderId, req.body.receiverId],
  });

  try {
    const saveRoom = await newRoom.save();
    res.status(200).json(saveRoom);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get conv of a user

router.get("/:userId", async (req, res) => {
  try {
    const Room = await Rooms.find({
      users: { $in: [req.params.userId] },
    });
    res.status(200).json(Room);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conv includes two userId
router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const Room = await Rooms.findOne({
      users: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
