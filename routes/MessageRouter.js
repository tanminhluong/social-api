const express = require("express");
const Message = require("../models/MessageModel");
const Account = require("../models/AccountModel");
const Chat = require("../models/ChatModel");

const router = express.Router();

router.post("/", async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  let newMessage = {
    sender: req.user.id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    let fullMessage = await Message.findOne({ _id: message._id })
      .populate("sender", "user_name avatar")
      .populate("chat");

    fullMessage = await Account.populate(fullMessage, {
      path: "chat.users",
      select: "user_name avatar email",
    });

    // message = await message.populate("sender", "user_name avatar");
    // message = await message.populate("chat");
    // message = await Account.populate(message, {
    //   path: "chat.users",
    //   select: "user_name avatar email",
    // });
    await Chat.findOneAndUpdate(
      { _id: chatId },
      {
        latestMessage: fullMessage,
      },
      { new: true }
    );
    res.json(fullMessage);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
router.get("/:chatId", async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "user_name avatar email")
      .populate("chat");
    res.status(200).json({
      code: 0,
      message: "get all messages successfully",
      data: messages,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = router;
