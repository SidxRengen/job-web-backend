const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }], 
  type: String,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
