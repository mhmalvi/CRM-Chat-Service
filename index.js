const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();
const mysql = require("mysql");
const multer = require("multer");

app.use(cors());

app.use("/public/static", express.static("public"));

// file upload destination
var storage = multer.diskStorage({
  destination: "./public",
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: 10000000, //10mb
});

const server = http.createServer(app);

let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "crm-system",
  multipleStatements: true,
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
  socket.on("join_room", (room) => {
    socket.join(room);
  });

  socket.on("send_message", (data) => {
    const sql = `INSERT INTO crm_conversation (sender_id, sender_name, receiver_id, receiver_name, message, date_time, status, room) VALUES (${data.sender_id}, "${data.sender_name}", ${data.recever_id}, "${data.recever_name}", "${data.message}", "${data.date_time}", 0, ${data.room})`;
    connection.query(sql, function (err, result) {
      if (err) throw err;
    });

    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("read_message", (data) => {
    console.log(data);
    const sql = `UPDATE crm_conversation SET status=1 WHERE id=${data}`;
    connection.query(sql, function (err, result) {
      if (err) throw err;
    });

    // const messagesSql = `SELECT * FROM crm_conversation WHERE receiver_id=${req?.params?.user_id}`;
    // connection.query(messagesSql, function (err, result) {
    //   if (err) throw err;
    //   socket.to(data.room).emit("messages", result);
    // });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

app.get("/get-message/:id", (req, res) => {
  const roomId = parseInt(req.params.id);
  const sql = `SELECT * FROM crm_conversation WHERE room=${roomId} ORDER BY id ASC`;
  connection.query(sql, function (err, data) {
    if (err) throw err;
    res.json(data);
  });
});

app.post("/message/uploadfile", upload.array("files"), (req, res) => {
  const files = req.files;

  if (Array.isArray(files) && files.length > 0) {
    console.log(files);
    for (let i = 0; i < files.length; i++) {
      const sql = `INSERT INTO crm_conversation (sender_id, receiver_id, message, date_time, status, room) VALUES (${req.body?.sender_id}, ${req.body?.recever_id}, "${files[i]?.filename}", "${req.body?.date_time}", 0, ${req.body?.room})`;
      connection.query(sql, function (err, result) {
        if (err) throw err;
      });
    }
    res.json(files);
  } else {
    throw new Error("File upload unsuccessful");
  }
});

app.get("/messages/:user_id", (req, res) => {
  const allMessagesSql = `SELECT * FROM crm_conversation WHERE receiver_id=${req?.params?.user_id}`;
  const allSendersSql = `SELECT * FROM crm_conversation WHERE receiver_id=${req?.params?.user_id} GROUP BY sender_id`;

  connection.query(allSendersSql, function (err, result) {
    if (err) console.log(err);
    console.log(result);
    res.json(result);
  });
});

app.get("/delete-message/:id", (req, res) => {
  const msgId = parseInt(req.params.id);
  const deleteMessageSql = `DELETE FROM crm_conversation WHERE id=${msgId}`;
  connection.query(deleteMessageSql, function (err, data) {
    if (err) throw err;
    res.json("Deleted");
  });
});

// app.post("/upload", upload.single("image"), (req, res) => {
//   if (!req.file) {
//     console.log("No file upload");
//   } else {
//     console.log(req.file.filename);
//     var imgsrc = "http://localhost:3000/images/" + req.file.filename;
//     var insertData = "INSERT INTO users_file(file_src)VALUES(?)";
//     connection.query(insertData, [imgsrc], (err, result) => {
//       if (err) throw err;
//       console.log("file uploaded");
//     });
//   }
// });

app.get("/", (req, res) => {
  res.json("Server is running");
});

server.listen(5000 || process.env.PORT, () => {
  console.log("Server is running ", process.env.PORT);
});
