

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { deductCredits, requestCredits, handleCreditRequest } = require("../utils/credits");

// Path to credits.json
const creditsFilePath = path.join(__dirname, "../data/credits.json");
console.log("Credits file path:", creditsFilePath); // Debugging

// Deduct credits for a scan
router.post("/deduct", (req, res) => {
  try {
    const { username } = req.body;

    // Validate input
    if (!username) {
      throw new Error("Username is required");
    }

    // Deduct credits
    deductCredits(username);

    res.status(200).json({ message: "Credits deducted successfully" });
  } catch (error) {
    console.error("Deduct credits error:", error.message); // Debugging
    res.status(400).json({ error: error.message });
  }
});

// Request additional credits
router.post("/request", (req, res) => {
  try {
    const { username, amount } = req.body;

    // Validate input
    if (!username || !amount) {
      throw new Error("Username and amount are required");
    }

    if (isNaN(amount)) {
      throw new Error("Amount must be a number");
    }

    // Request additional credits
    requestCredits(username, amount);

    res.status(200).json({ message: "Credit request submitted" });
  } catch (error) {
    console.error("Request credits error:", error.message); // Debugging
    res.status(400).json({ error: error.message });
  }
});

// Fetch pending credit requests (for admin)
// Fetch pending credit requests
router.get("/admin/requests", (req, res) => {
    try {
      const requests = JSON.parse(fs.readFileSync(creditsFilePath, "utf-8"));
      const pendingRequests = requests.filter((req) => req.status === "pending");
      res.status(200).json(pendingRequests);
    } catch (error) {
      console.error("Fetch credit requests error:", error.message);
      res.status(500).json({ error: "Failed to fetch credit requests" });
    }
  });


// Admin: Approve/Deny credit requests
router.post("/admin/handle", (req, res) => {
  try {
    const { username, action } = req.body;

    // Validate input
    if (!username || !action) {
      throw new Error("Username and action are required");
    }

    if (!["approve", "deny"].includes(action)) {
      throw new Error("Action must be 'approve' or 'deny'");
    }

    // Handle credit request
    handleCreditRequest(username, action);

    res.status(200).json({ message: `Credit request ${action}d` });
  } catch (error) {
    console.error("Handle credit request error:", error.message); // Debugging
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

