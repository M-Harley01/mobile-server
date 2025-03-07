//server.js

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const colleagueIDs = []; 
const passwords = [];
const mappedDetails = new Map;

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

function readDatabase(){
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

      if (line.includes("password:")){
        const password = line.split(":")[1]?.trim();
        if (password){
          passwords.push(password);
        }
      }
    });

    console.log("IDs found:", colleagueIDs);
    console.log("passwords found", passwords);
  } catch (err) {
    console.error("Error reading file:", err);
  }
}

function setMap(){
  for(i = 0; i < colleagueIDs.length; i++){
    mappedDetails.set(colleagueIDs[i], passwords[i])
  }
}

readDatabase();
setMap();

//allows a user to log in
app.post("/api/receive", (req, res) => {
  const { text1, text2 } = req.body; 

   if (mappedDetails.has(text1) && mappedDetails.get(text1) === text2) {
    console.log("User ID and password match");
    res.json({ success: true }); 
  } else {
    console.log("Incorrect user ID or password");
    res.json({ success: false, message: "Incorrect username or password" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});