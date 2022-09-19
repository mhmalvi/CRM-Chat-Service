const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();
const mysql = require("mysql");

app.use(cors());

const server = http.createServer(app);

let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "crm-conversation",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    const sql = `INSERT INTO crm-conversation (sender_id, receiver_id, message, date_time, status, room) VALUES (${data.sender_id}, ${data.receiver_id}, ${data.message}, '', '0', ${data.room})`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });

    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

app.get("/", (req, res) => {
  res.json("Server is running");
});

server.listen(5000, () => {
  console.log("Server is running");
});
