

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const usersFilePath = path.join(__dirname, "../data/users.json");
const creditsFilePath = path.join(__dirname, "../data/credits.json");

// // Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  const { username } = req.body;

  const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));
  const user = users.find((u) => u.username === username);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  next();
};

// Get analytics
router.get("/analytics", (req, res) => {
  try {
    const users = JSON.parse(fs.readFileSync(usersFilePath));
    const credits = JSON.parse(fs.readFileSync(creditsFilePath));

    const analytics = {
      totalUsers: users.length,
      totalScans: users.reduce((sum, user) => sum + (20 - user.credits), 0),
      pendingCreditRequests: credits.filter((req) => req.status === "pending").length,
      topUsers: users
        .map((user) => ({ username: user.username, scans: 20 - user.credits }))
        .sort((a, b) => b.scans - a.scans)
        .slice(0, 5),
    };

    res.status(200).json(analytics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;