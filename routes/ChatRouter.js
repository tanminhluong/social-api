const express = require("express");
const Chat = require("../models/ChatModel");
const Account = require("../models/AccountModel");

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("userId not send with request");
    return res.status(400).send("");
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user.id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await Account.populate(isChat, {
    path: "latestMessage.sender",
    select: "user_name avatar email",
  });
  //   console.log(isChat);
  //   res.send(isChat);
  if (isChat.length > 0) {
    res.json({ code: 0, message: "Success", data: isChat[0] });
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user.id, userId],
    };
    try {
      const createdChat = await Chat.create(chatData);

      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      return res
        .status(200)
        .json({ code: 0, message: "Success", data: fullChat });
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

router.get("/", async (req, res) => {
  try {
    let result = await Chat.find({
      users: { $elemMatch: { $eq: req.user.id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: "desc" });
    result = await Account.populate(result, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
    res.send(result);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// update seen status
router.put("/:chatId", async (req, res) => {
  const { chatId } = req.params;
  try {
    let updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        seen: true,
      },
      { new: true }
    ).populate("users", "-password");
    return res
      .status(200)
      .json({ code: 0, message: "Đã xem tin nhắn", data: updatedChat });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// router.post("/group", protect, createGroupChat);
// router.put("/rename", protect, renameGroup);
// router.put("/group-remove", protect, removeFromGroup);
// router.put("/group-add", protect, addToGroup);
module.exports = router;
