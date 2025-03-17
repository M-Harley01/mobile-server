//databaseUtils.js

const fs = require("fs");

const colleagueIDs = [];
const passwords = [];

function readDatabase() {
  try {
    const data = fs.readFileSync("dataBase.txt", "utf8");
    const lines = data.split("\n");

    lines.forEach((line) => {
      if (line.includes("colleagueID")) {
        const colleagueID = line.split(":")[1]?.trim();
        if (colleagueID) {
          colleagueIDs.push(colleagueID);
        }
      }

      if (line.includes("password:")) {
        const password = line.split(":")[1]?.trim();
        if (password) {
          passwords.push(password);
        }
      }
    });

  } catch (err) {
    console.error("Error reading file:", err);
  }
}

function setMap() {
  for (let i = 0; i < colleagueIDs.length; i++) {
    mappedDetails.set(colleagueIDs[i], passwords[i]);
  }
}

function readUserDetails() {
  let users = [];
  try {
    const rawData = fs.readFileSync("users.json");
    users = JSON.parse(rawData);
    console.log("User data successfully gathered");
  } catch (err) {
    console.log("User data unable to be loaded", err);
  }
  return users;
}

module.exports = {
  readDatabase,
  readUserDetails,
};
