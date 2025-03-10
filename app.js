

const express = require("express");
const fs = require("fs");
const path = require("path");
const { hashPassword } = require("./utils/auth");
const cors = require("cors");

// Initialize Express app
const app = express();

// Path to users.json
const usersFilePath = path.join(__dirname, "data/users.json");

// Create default admin user if it doesn't exist
const createDefaultAdmin = () => {
  const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));
  const adminExists = users.some((user) => user.username === "admin");
  if (!adminExists) {
    users.push({
      username: "admin",
      password: hashPassword("admin123"), // Hash the default password
      credits: 20,
      role: "admin",
    });
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    console.log("Default admin user created.");
  }
};

// Call the function to create default admin
createDefaultAdmin();

// Enable CORS with credentials
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Allow only your frontend origin
  credentials: true, // Allow credentials (cookies, authorization headers)
}));

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the public folder
app.use(express.static("public"));

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const scanRoutes = require("./routes/scan");
const creditRoutes = require("./routes/credits");
const adminRoutes = require("./routes/admin");

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/scan", scanRoutes);
app.use("/credits", creditRoutes);
app.use("/admin", adminRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});