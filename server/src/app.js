const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("GastroChef API running");
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
