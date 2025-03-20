//databaseUtils.js

const fs = require("fs");
const path = require("path")

const colleagueIDs = [];
const passwords = [];

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

const usersFilePath = path.join(__dirname, "../users.json");

function changeCheckedIn(colleagueID){
  fs.readFile(usersFilePath, "utf8", (err,data) => {
    if(err){
      console.error("Error reading users file:", err);
      return;
    }

    let users = JSON.parse(data);

    let user = users.find(u => u.colleagueID === colleagueID);

    if(!user){
      console.error("User not found. ");
      return;
    }

    user.checkedIn = true;

    fs.writeFile(usersFilePath, JSON.stringify(users,null, 2), "utf8", (err) =>{
      if(err){
        console.error("error writing user file: ", err);
      }
      else{
        console.log(`user ${colleagueID} successfully checked in`)
      }
    });
  });
}

module.exports = {
  readUserDetails,
  changeCheckedIn
};
