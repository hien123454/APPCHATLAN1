const User = require("./models/User");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("a user connected.");
    if (io.req) {
      //socket.broadcast.emit("friend-login-status", { user_id: io.req.userId });
      addSocketIdInDB(socket.id, io.req.payload.userId);
      
      socket.on("disconnect", () => {
        // socket.broadcast.emit("friend-logout-status", {
        //   user_id: io.req.payload.userId,
        // });
        io.req.userId = null;
      });
    }
  });
};

async function addSocketIdInDB(socket_id, user_id) {
  const user = await User.findById(user_id);
  if (socket_id) {
    user.socketId = socket_id;
  }
  await user.save();
}
