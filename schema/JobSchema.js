const mongoose = require("mongoose");
const { Schema } = mongoose;

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  company: String,
  location: String,
  companyId: String,
  comapnyEmail: String,
  salary: Number,
});
const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
