const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs").promises; // Use promises for async file operations
const path = require("path");
const { deductCredits } = require("../utils/credits");
const { findSimilarDocuments } = require("../utils/matching");

// Path to documents.json
const documentsFilePath = path.join(__dirname, "../data/documents.json");

// Configure multer for file uploads
const upload = multer();

// Upload and scan document
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debugging
    console.log("Request file:", req.file); // Debugging

    // Validate file upload
    if (!req.file) {
      throw new Error("No file uploaded");
    }

    const file = req.file;
    const { username } = req.body;

    // Validate username
    if (!username) {
      throw new Error("Username is required");
    }

    // Validate file type (plain text)
    if (file.mimetype !== "text/plain") {
      throw new Error("Only plain text files (.txt) are allowed");
    }

    // Deduct 1 credit for the scan
    deductCredits(username);

    // Read the uploaded file
    const fileContent = file.buffer.toString("utf-8");
    console.log("Uploaded file content:", fileContent); // Debugging

    // Get similarity threshold from query parameter (default: 0.7)
    const threshold = parseFloat(req.query.threshold) || 0.7;

    // Find similar documents
    const matches = findSimilarDocuments(fileContent, threshold);
    console.log("Similar documents:", matches); // Debugging

    // Save the uploaded document (optional)
    const documents = JSON.parse(await fs.readFile(documentsFilePath, "utf-8"));
    const newDocument = {
      id: documents.length + 1,
      content: fileContent,
    };
    documents.push(newDocument);
    await fs.writeFile(documentsFilePath, JSON.stringify(documents, null, 2));

    // Return the matches
    res.status(200).json({ matches });
  } catch (error) {
    console.error("Scan error:", error.message); // Debugging
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;