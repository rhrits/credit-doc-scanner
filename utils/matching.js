
const fs = require("fs");
const path = require("path");
const natural = require("natural");

const documentsFilePath = path.join(__dirname, "../data/documents.json");

// Find similar documents using Jaro-Winkler
const findSimilarDocuments = (text, threshold = 0.7) => {
  const documents = JSON.parse(fs.readFileSync(documentsFilePath, "utf-8"));

  if (!text || !documents.length) {
    return []; // Return empty array if input is invalid or no documents exist
  }

  return documents
    .map((doc) => ({
      id: doc.id,
      content: doc.content,
      similarity: natural.JaroWinklerDistance(text, doc.content), // Jaro-Winkler similarity
    }))
    .filter((doc) => doc.similarity >= threshold) // Filter by threshold
    .sort((a, b) => b.similarity - a.similarity) // Sort by similarity (descending)
    .slice(0, 5); // Return top 5 matches
};

module.exports = { findSimilarDocuments };