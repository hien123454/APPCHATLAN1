const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = Schema(
  {
    name: String,
    users: Array,
    group: Boolean,
  },
  { timestamps: true }
);

const Rooms = mongoose.model("Rooms", RoomSchema);
module.exports = Rooms;
