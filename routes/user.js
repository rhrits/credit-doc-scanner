const express = require("express");
const router = express.Router();
const fs = require("fs").promises; // Use promises for async file operations
const path = require("path");

// Path to users.json
const usersFilePath = path.join(__dirname, "../data/users.json");

// Helper function to read users from the file
const readUsers = async () => {
  const data = await fs.readFile(usersFilePath, "utf-8");
  return JSON.parse(data);
};

// Helper function to write users to the file
const writeUsers = async (users) => {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
};

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const { username } = req.query;

    // Validate input
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    // Read users from the file
    const users = await readUsers();

    // Find the user
    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user profile (excluding sensitive data like password)
    res.status(200).json({
      username: user.username,
      credits: user.credits,
      role: user.role,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Update user credits
router.post("/update-credits", async (req, res) => {
  try {
    const { username, credits } = req.body;

    // Validate input
    if (!username || credits === undefined) {
      return res.status(400).json({ error: "Username and credits are required" });
    }

    if (isNaN(credits)) {
      return res.status(400).json({ error: "Credits must be a number" });
    }

    // Read users from the file
    const users = await readUsers();

    // Find the user
    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user credits
    user.credits = credits;

    // Save updated users to the file
    await writeUsers(users);

    // Return success response
    res.status(200).json({ message: "Credits updated successfully", user });
  } catch (error) {
    console.error("Error updating user credits:", error.message);
    res.status(500).json({ error: "Failed to update user credits" });
  }
});

module.exports = router;