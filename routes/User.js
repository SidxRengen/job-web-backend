require("dotenv").config();
const express = require("express");
const User = require("../schema/UserSchema");
const UserRoute = express.Router();
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

UserRoute.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const emailExist = await User.findOne({ email });
  if (emailExist)
    return res.status(400).json({ message: "Email already exists" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    username,
    email,
    type:"user",
    password: hashedPassword,
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// User Login
UserRoute.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ message: "Email or password is wrong" });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign(
    { _id: user._id, type: "user" },
    process.env.JWT_SECRET
  );
  res.header("Authorization", token).json({ token });
});

//comapany
UserRoute.post("/company/register", async (req, res) => {
  const { username, email, password } = req.body;

  const emailExist = await User.findOne({ email });
  if (emailExist)
    return res.status(400).json({ message: "Email already exists" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const company = new User({
    username,
    email,
    type:"company",
    password: hashedPassword,
  });

  try {
    const newCompany = await company.save();
    res.status(201).json(newCompany);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Company Login
UserRoute.post("/company/login", async (req, res) => {
  const { email, password } = req.body;

  const company = await User.findOne({ email });
  if (!company)
    return res.status(400).json({ message: "Email or password is wrong" });

  const validPass = await bcrypt.compare(password, company.password);
  if (!validPass) return res.status(400).json({ message: "Invalid password" });
  const token = jwt.sign(
    { _id: company._id, type: "company" },
    process.env.JWT_SECRET
  );

  res.header("Authorization", token).json({ token });
});

module.exports = UserRoute;
