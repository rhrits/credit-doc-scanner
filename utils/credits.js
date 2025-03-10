const fs = require("fs").promises; // Use asynchronous file operations
const path = require("path");
const usersFilePath = path.join(__dirname, "../data/users.json");
const creditsFilePath = path.join(__dirname, "../data/credits.json");

// Helper functions for file operations
const readJSONFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw new Error("Failed to read file");
  }
};

const writeJSONFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw new Error("Failed to write file");
  }
};

// Initialize files if they don't exist
const initializeFile = async (filePath, defaultData) => {
  try {
    await fs.access(filePath); // Check if file exists
  } catch (error) {
    // If file doesn't exist, create it with default data
    await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
  }
};

// Initialize files on startup
(async () => {
  await initializeFile(usersFilePath, []);
  await initializeFile(creditsFilePath, []);
})();

// Reset daily credits at midnight
const resetDailyCredits = async () => {
  try {
    const users = await readJSONFile(usersFilePath);
    users.forEach((user) => {
      if (user.role === "user") {
        user.credits = 20; // Reset to default daily credits
      }
    });
    await writeJSONFile(usersFilePath, users);
    console.log("Daily credits reset at", new Date().toISOString());
  } catch (error) {
    console.error("Error resetting daily credits:", error);
  }
};

// Schedule daily reset
const scheduleReset = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const timeUntilMidnight = midnight - now;

  setTimeout(async () => {
    await resetDailyCredits();
    scheduleReset(); // Schedule the next reset
  }, timeUntilMidnight);

  console.log(`Next credit reset scheduled in ${timeUntilMidnight / 1000 / 60 / 60} hours`);
};

// Deduct credits for a scan
const deductCredits = async (username) => {
  try {
    const users = await readJSONFile(usersFilePath);
    const user = users.find((u) => u.username === username);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.credits < 1) {
      throw new Error("Insufficient credits");
    }

    user.credits -= 1;
    await writeJSONFile(usersFilePath, users);
    console.log(`Deducted 1 credit from ${username}. Remaining credits: ${user.credits}`);
  } catch (error) {
    console.error("Error deducting credits:", error);
    throw error;
  }
};

// Request additional credits
const requestCredits = async (username, amount) => {
  try {
    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("Invalid credit amount");
    }

    const requests = await readJSONFile(creditsFilePath);
    requests.push({
      username,
      amount,
      status: "pending",
      requestedAt: new Date().toISOString(),
    });

    await writeJSONFile(creditsFilePath, requests);
    console.log(`Credit request from ${username} for ${amount} credits`);
  } catch (error) {
    console.error("Error requesting credits:", error);
    throw error;
  }
};

// Approve/Deny credit requests (admin only)
const handleCreditRequest = async (username, action, adminUsername) => {
  try {
    const requests = await readJSONFile(creditsFilePath);
    const users = await readJSONFile(usersFilePath);

    const request = requests.find((req) => req.username === username && req.status === "pending");
    if (!request) {
      throw new Error("No pending request found");
    }

    const user = users.find((u) => u.username === username);
    if (!user) {
      throw new Error("User not found");
    }

    if (action === "approve") {
      if (request.amount <= 0) {
        throw new Error("Invalid credit amount");
      }
      user.credits += request.amount;
      request.status = "approved";
      request.approvedBy = adminUsername; // Track who approved the request
      request.approvedAt = new Date().toISOString();
      console.log(`Approved credit request for ${username}. Added ${request.amount} credits.`);
    } else if (action === "deny") {
      request.status = "denied";
      request.deniedBy = adminUsername; // Track who denied the request
      request.deniedAt = new Date().toISOString();
      console.log(`Denied credit request for ${username}.`);
    } else {
      throw new Error("Invalid action");
    }

    await writeJSONFile(creditsFilePath, requests);
    await writeJSONFile(usersFilePath, users);
  } catch (error) {
    console.error("Error handling credit request:", error);
    throw error;
  }
};

module.exports = { deductCredits, requestCredits, handleCreditRequest, scheduleReset };