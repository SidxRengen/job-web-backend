require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JobRoute = express.Router();
const Job = require("../schema/JobSchema");
const User = require("../schema/UserSchema");

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(400).json({ message: "Invalid Token" });
  }
};

// Job Routes
JobRoute.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().populate("company", "name");
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

JobRoute.get("/search", async (req, res) => {
  const { query } = req.query;
  try {
    const jobs = await Job.find({ $text: { $search: query } }).populate(
      "company",
      "name"
    );
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

JobRoute.post("/jobs", authenticateToken, async (req, res) => {
  const { title, description, location, salary } = req.body;
  const companyId = req.user._id; // assuming req.user contains the company info after token verification
  const company = await User.findById(companyId);
  const newJob = new Job({
    title,
    description,
    location,
    salary,
    company: company.username,
    companyId: companyId,
    comapnyEmail: company.email,
  });

  try {
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

JobRoute.post("/apply/:jobId", authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { appliedJobs: job._id },
    });
    res.status(200).json({ message: "Application successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

JobRoute.get("/applications", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("appliedJobs");
    res.json(user.appliedJobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
JobRoute.delete("/jobs/:id", authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.companyId.toString() !== req.user._id) {
      return res.status(403).json({ message: "Access Denied" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
JobRoute.get("/jobs/not-applied", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("appliedJobs");
    const appliedJobIds = user.appliedJobs.map((job) => job._id);
    const jobs = await Job.find({ _id: { $nin: appliedJobIds } }).populate(
      "company",
      "name"
    );
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = JobRoute;
