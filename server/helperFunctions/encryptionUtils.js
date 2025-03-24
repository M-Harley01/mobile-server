const fs = require("fs");
const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const KEY = crypto.createHash("sha256").update("your-strong-secret-key").digest("base64").substr(0, 32);
const IV = crypto.randomBytes(16); 

function encryptJSONToFile(filePath, jsonData) {
  const data = JSON.stringify(jsonData, null, 2);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  const payload = {
    iv: IV.toString("hex"),
    content: encrypted,
  };

  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
}

function decryptJSONFromFile(filePath) {
  const fileData = fs.readFileSync(filePath, "utf8");
  const { iv, content } = JSON.parse(fileData);

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(iv, "hex"));
  let decrypted = decipher.update(content, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
}

module.exports = {
  encryptJSONToFile,
  decryptJSONFromFile,
};
