require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require('cors');


// const MONGO_URL =
  // "mongodb+srv://gautamsiddharth226:sidhu1%40S@jobwebsite.soxwmbr.mongodb.net/?retryWrites=true&w=majority&appName=jobWebsite";

mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("connected!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

const UserRoute = require("./routes/User");
const JobRoute = require("./routes/Job");
const MessageRoute = require("./routes/Message");
app.use(cors());

app.use(express.json());
app.use("/user", UserRoute);
app.use("/job", JobRoute);
app.use("/message", MessageRoute);

app.get("/", (req, res) => {
  res.send({ home: "True" }).status(200);
});

const PORT = process.env.BACKEND_PORT || 5001;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}!`);
});

module.exports = app;
