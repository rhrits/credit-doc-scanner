
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const usersFilePath = path.join(__dirname, "../data/users.json");

// Hash password using SHA-256
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// Register a new user
const registerUser = (username, password) => {
  const users = JSON.parse(fs.readFileSync(usersFilePath));
  const userExists = users.some((user) => user.username === username);
  if (userExists) throw new Error("User already exists");

  // Automatically assign admin role for a specific username
  const role = username === "admin" ? "admin" : "user";

  users.push({ username, password: hashPassword(password), credits: 20, role });
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Login a user
const loginUser = (username, password) => {
  const users = JSON.parse(fs.readFileSync(usersFilePath));
  const user = users.find(
    (user) => user.username === username && user.password === hashPassword(password)
  );
  if (!user) throw new Error("Invalid credentials");
  return user;
};

module.exports = { registerUser, loginUser, hashPassword };