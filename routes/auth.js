const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../utils/auth");

// Register endpoint
router.post("/register", (req, res) => {
  try {
    const { username, password } = req.body;
    registerUser(username, password);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login endpoint
router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;
    const user = loginUser(username, password);
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;