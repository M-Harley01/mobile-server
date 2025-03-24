// tools/viewEncrypted.js
const fs = require("fs");
const path = require("path");
const { decryptJSONFromFile } = require("../server/helperFunctions/encryptionUtils");

const filesToView = ["users.json", "report.json", "schedule.json"];

filesToView.forEach((filename) => {
  const filePath = path.join(__dirname, "../server", filename);

  try {
    const data = decryptJSONFromFile(filePath);
    console.log(`\n${filename}:\n`);
    console.dir(data, { depth: null, colors: true });
  } catch (err) {
    console.error(`Failed to read ${filename}:`, err.message);
  }
});
