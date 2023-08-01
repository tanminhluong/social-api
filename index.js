require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const helmet = require("helmet");

const AccountModel = require("./models/AccountModel");
const RoleRouter = require("./routes/RoleRouter");
const NotificationrRouter = require("./routes/NotificationRouter");
const AccountRouter = require("./routes/AccountRouter");
const AdminRouter = require("./routes/AdminRouter");
const NewFeedRouter = require("./routes/NewFeedRouter");
const AddRole = require("./routes/AddRole");
const MessageRouter = require("./routes/MessageRouter");
const ChatRouter = require("./routes/ChatRouter");
const apigoogle = require("./routes/apigoogle");
const connectDB = require("./configCloud/db");
const passportSetup = require("./routes/validators/googlePassport");

dotenv.config();
const app = express();
connectDB();
var whitelist = [
  "http://localhost:9000",
  "https://master--stdsocialnetwork.netlify.app",
];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(passport.initialize());
app.use(passport.session());

const CheckLogin = require("./auth/CheckLogin");
const CheckAdmin = require("./middleware/CheckAdmin");

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "50mb" }));
app.use(
  helmet({
    crossOriginOpenerPolicy: "cross-origin-allow-popups",
  })
);

app.get("/", (req, res) => {
  res.json({
    code: 0,
    message: "Welcome to my REST API",
    time: new Date().toLocaleTimeString(),
  });
});

app.get("/resetpassword", async (req, res) => {
  try {
    resetpassword = await bcrypt.hash("123456789", 10);
    await AccountModel.updateOne(
      { user_name: "Admin" },
      { password: resetpassword }
    );
    return res.json({ code: 0, message: "password đổi thành công: 123456789" });
  } catch (err) {
    return res.json({ code: 1, message: err.message });
  }
});

app.use("/role", RoleRouter);
app.use("/notification", CheckLogin, NotificationrRouter);
app.use("/account", AccountRouter);
app.use("/addrole", AddRole);
app.use("/admin", CheckLogin, CheckAdmin, AdminRouter);
app.use("/newfeed", CheckLogin, NewFeedRouter);
app.use("/api", apigoogle);
app.use("/chat", CheckLogin, ChatRouter);
app.use("/message", CheckLogin, MessageRouter);

// mongodb+srv://adminPDA:<password>@cluster0.v9bnw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
// adminPDA
// mn2jHpinkZEvtYi
const PORT = process.env.PORT;

const server = app.listen(PORT, console.log(`http://localhost:${PORT}`));

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:9000",
  },
});

app.set("socketio", io);

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);

    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User join room: " + room);
  });

  socket.on("typing", (room) => socket.to(room).emit("typing"));
  socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

  socket.on("new message", (newMessage) => {
    let chat = newMessage.chat;

    if (!chat.users) return console.log("chat.user not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;

      socket.to(user._id).emit("message received", newMessage);
    });
  });

  // socket.on("newLikePost", (data) => {
  //   console.log(data);
  //   socket.emit("new_likelist", data);
  // });

  socket.off("setup", () => {
    console.log("User disconnected");
    socket.leave(userData._id);
  });
});
