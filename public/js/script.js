

const BACKEND_URL = "http://54.86.185.162:3000/";


// Function to show feedback messages
const showFeedback = (message, type = "success") => {
  const feedbackDiv = document.getElementById("feedback");
  feedbackDiv.textContent = message;
  feedbackDiv.style.display = "block";
  feedbackDiv.style.backgroundColor = type === "success" ? "#d4edda" : "#f8d7da";
  feedbackDiv.style.color = type === "success" ? "#155724" : "#721c24";
  feedbackDiv.style.border = `1px solid ${type === "success" ? "#c3e6cb" : "#f5c6cb"}`;
  feedbackDiv.style.padding = "10px";
  feedbackDiv.style.borderRadius = "5px";
  feedbackDiv.style.marginTop = "10px";

  setTimeout(() => {
    feedbackDiv.style.display = "none";
  }, 3000);
};



const fetchUserProfile = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/profile`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include cookies if using session-based auth
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const data = await response.json();
    document.getElementById("creditsDisplay").textContent = data.user.credits;
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
};




// Login functionality
document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();
    if (data.user) {
      document.getElementById("auth").style.display = "none";
      document.getElementById("profile").style.display = "block";
      document.getElementById("usernameDisplay").textContent = data.user.username;
      document.getElementById("creditsDisplay").textContent = data.user.credits;

      // Show admin dashboard if user is an admin
      if (data.user.role === "admin") {
        document.getElementById("admin").style.display = "block";
        document.getElementById("scanSection").style.display = "none"; // Hide scan section
        document.getElementById("creditRequestSection").style.display = "none"; // Hide credit request section
      } else {
        document.getElementById("scanSection").style.display = "block"; // Show scan section
        document.getElementById("creditRequestSection").style.display = "block"; // Show credit request section
      }

      showFeedback("Login successful", "success");

      // Fetch and update credits periodically
      setInterval(fetchUserProfile, 5000);
    }
  } catch (error) {
    showFeedback(error.message, "error");
  }
});

// Register functionality
document.getElementById("registerBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    const data = await response.json();
    showFeedback(data.message, "success");
  } catch (error) {
    showFeedback(error.message, "error");
  }
});

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
  document.getElementById("auth").style.display = "block";
  document.getElementById("profile").style.display = "none";
  document.getElementById("admin").style.display = "none";
  document.getElementById("scanSection").style.display = "none";
  document.getElementById("creditRequestSection").style.display = "none";
  showFeedback("Logged out successfully", "success");
});

// Admin: View analytics
document.getElementById("viewAnalyticsBtn").addEventListener("click", async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/admin/analytics`);
    if (!response.ok) {
      throw new Error("Failed to fetch analytics");
    }

    const data = await response.json();
    const analyticsResult = document.getElementById("analyticsResult");
    analyticsResult.innerHTML = `
      <h3>Analytics Overview</h3>
      <p><strong>Total Users:</strong> ${data.totalUsers}</p>
      <p><strong>Total Scans:</strong> ${data.totalScans}</p>
      <p><strong>Pending Credit Requests:</strong> ${data.pendingCreditRequests}</p>
      <h4>Top Users by Scans:</h4>
      <ul>
        ${data.topUsers
          .map(
            (user) => `
          <li>
            <strong>${user.username}</strong>: ${user.scans} scans
          </li>
        `
          )
          .join("")}
      </ul>
    `;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    const analyticsResult = document.getElementById("analyticsResult");
    analyticsResult.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  }
});

// Handle file upload for scanning
document.getElementById("scanBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  const username = document.getElementById("usernameDisplay").textContent;

  if (!file) {
    showFeedback("Please select a file to scan", "error");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("username", username);

  try {
    const response = await fetch(`${BACKEND_URL}/scan/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Scan failed");
    }

    const data = await response.json();
    const scanResult = document.getElementById("scanResult");
    scanResult.innerHTML = `
      <h4>Scan Results:</h4>
      <ul>
        ${data.matches
          .map(
            (match) => `
          <li>
            <strong>Document ID:</strong> ${match.id}<br>
            <strong>Similarity:</strong> ${match.similarity.toFixed(2)}
          </li>
        `
          )
          .join("")}
      </ul>
    `;

    showFeedback("Scan completed successfully", "success");

    // Update credits after the scan
    await fetchUserProfile();
  } catch (error) {
    showFeedback(error.message, "error");
  }
});

// Handle credit request
document.getElementById("requestCreditsBtn").addEventListener("click", async () => {
  const amount = parseFloat(document.getElementById("creditAmount").value);
  const username = document.getElementById("usernameDisplay").textContent;

  if (isNaN(amount) || amount <= 0) {
    showFeedback("Please enter a valid amount", "error");
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/credits/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, amount }),
    });

    if (!response.ok) {
      throw new Error("Credit request failed");
    }

    const data = await response.json();
    showFeedback(data.message, "success");

    // Update credits after the request
    await fetchUserProfile();
  } catch (error) {
    showFeedback(error.message, "error");
  }
});

// Fetch and display pending credit requests
document.getElementById("viewCreditRequestsBtn").addEventListener("click", async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/credits/admin/requests`);
    if (!response.ok) {
      throw new Error("Failed to fetch credit requests");
    }

    const data = await response.json();
    console.log("Fetched credit requests:", data); // Debugging
    const creditRequestsList = document.getElementById("creditRequestsList");
    creditRequestsList.innerHTML = data
      .map(
        (request) => `
        <li>
          <strong>Username:</strong> ${request.username}<br>
          <strong>Amount:</strong> ${request.amount}<br>
          <button onclick="handleCreditRequest('${request.username}', 'approve')">Approve</button>
          <button onclick="handleCreditRequest('${request.username}', 'deny')">Deny</button>
        </li>
      `
      )
      .join("");
  } catch (error) {
    console.error("Fetch error:", error); // Debugging
    showFeedback(error.message, "error");
  }
});

// Handle credit request approval/denial
const handleCreditRequest = async (username, action) => {
  try {
    const response = await fetch(`${BACKEND_URL}/credits/admin/handle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, action }),
    });

    if (!response.ok) {
      throw new Error("Failed to handle credit request");
    }

    const data = await response.json();
    showFeedback(data.message, "success");

    // Refresh the list of credit requests
    document.getElementById("viewCreditRequestsBtn").click();
  } catch (error) {
    showFeedback(error.message, "error");
  }
};


