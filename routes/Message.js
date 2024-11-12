const express = require("express");
const MessageRoute = express.Router();
const Message = require("../schema/MessageSchema");
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

MessageRoute.post("/message", authenticateToken, async (req, res) => {
  // if (req.user.type !== "user")
  //   return res.status(403).json({ message: "Access Denied" });

  const { to, content } = req.body;

  const message = new Message({
    from: req.user._id,
    to,
    content,
  });

  try {
    const newMessage = await message.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

MessageRoute.get("/messages", authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ from: req.user._id }, { to: req.user._id }]
    }).populate("from", "username").populate("to", "username");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = MessageRoute;
