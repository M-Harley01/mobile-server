// tools/migrateToEncrypted.js
const fs = require("fs");
const path = require("path");
const { encryptJSONToFile } = require("../server/helperFunctions/encryptionUtils");

const filesToEncrypt = ["schedule.json"];

filesToEncrypt.forEach((filename) => {
  const filePath = path.join(__dirname, "../server", filename);
  const rawData = fs.readFileSync(filePath, "utf-8");
  const jsonData = JSON.parse(rawData);

  encryptJSONToFile(filePath, jsonData);
  console.log(`Encrypted ${filename} `);
});
