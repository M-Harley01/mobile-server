// server/helperFunctions/databaseUtils.js

const fs = require("fs");
const path = require("path");
const { decryptJSONFromFile, encryptJSONToFile } = require("./encryptionUtils");

const usersFilePath = path.join(__dirname, "../users.json");

function readUserDetails() {
  try {
    const users = decryptJSONFromFile(usersFilePath);
    console.log("User data successfully gathered");
    return users;
  } catch (err) {
    console.log("User data unable to be loaded", err);
    return [];
  }
}

function changeCheckedIn(colleagueID) {
  try {
    const users = decryptJSONFromFile(usersFilePath);
    const user = users.find((u) => u.colleagueID === colleagueID);

    if (!user) {
      console.error("User not found.");
      return;
    }

    user.checkedIn = true;
    encryptJSONToFile(usersFilePath, users);
    console.log(`User ${colleagueID} successfully checked in`);
  } catch (err) {
    console.error("Error updating check-in status:", err);
  }
}

module.exports = {
  readUserDetails,
  changeCheckedIn
};
