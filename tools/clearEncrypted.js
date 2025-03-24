// tools/clearEncrypted.js
const path = require("path");
const { encryptJSONToFile } = require("../server/helperFunctions/encryptionUtils");

const filesToClear = ["report.json"]; 

filesToClear.forEach((filename) => {
  const filePath = path.join(__dirname, "../server", filename);
  try {
    encryptJSONToFile(filePath, []); 
    console.log(`Cleared ${filename}`);
  } catch (err) {
    console.error(`Failed to clear ${filename}:`, err.message);
  }
});
