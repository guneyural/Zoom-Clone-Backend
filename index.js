const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const PORT = 3001;

app.get("/", (req, res) => {
  res.send("Hello World");
});

let users = [];

const addUser = (username, roomId) => {
  users.push({ username, roomId });
};

const getRoomUsers = (roomId) => {
  return users.filter((user) => user.roomId == roomId);
};

const userLeave = (username) => {
  users = users.filter((user) => user.username === username);
};

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, username }) => {
    if (roomId && username) {
      socket.join(roomId);

      addUser(username, roomId);

      socket.to(roomId).emit("user-connected", username);

      io.to(roomId).emit("all-users", getRoomUsers(roomId));
    }

    socket.on("disconnect", () => {
      socket.leave(roomId);
      socket.disconnect();

      userLeave(username);

      io.to(roomId).emit("all-users", getRoomUsers(roomId));
    });
  });
});

server.listen(PORT, () =>
  console.log(`Zoom Clone API listening on localhost:${PORT}`)
);
