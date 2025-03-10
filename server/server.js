//server.js

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const colleagueIDs = []; 
const passwords = [];
const mappedDetails = new Map;

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: "*", // Allow all origins (you can restrict this to specific origins)
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type",
};

app.use(cors(corsOptions));

app.use(express.json());

const rawData = fs.readFileSync("schedule.json");
const schedules = JSON.parse(rawData);

function getUserSchedule(colleagueID, month){
  const user = schedules.find(user => user.colleagueID === colleagueID);
  
  if(!user){
    console.log(`couldn't find user ID`);
    return null;
  }

  if(!user[month]){
    console.log(`Couldn't find month specified`);
    return null;
  }

  return user[month];
}

function getScheduleDetails(userSchedule) {
  userSchedule.forEach((entry) => {  

    if (entry.date) { 
      dayDates.push(entry.date);
    }

    if (entry.time) { 
      times.push(entry.time);
    }

    if (entry.type) { 
      types.push(entry.type);
    }
  });
}

app.get("/api/schedule", (req, res) => {
  let { colleagueID, month } = req.query;

  console.log(`Received request: colleagueID = ${colleagueID}, month = ${month}`);

  if (!colleagueID || !month) {
    console.log("Missing colleagueID or month");
    return res.status(400).json({ success: false, message: "Missing colleagueID or month" });
  }

  if(!colleagueID.startsWith('#')){
    colleagueID = `#${colleagueID}`;
  }

  const userSchedule = getUserSchedule(colleagueID, month);

  if (!userSchedule) {
    console.log(` No schedule found for colleagueID = ${colleagueID}, month = ${month}`);
    return res.json({ success: false, message: "Schedule not found" });
  }

  const dayDates = userSchedule.map(entry => entry.date);
  const times = userSchedule.map(entry => entry.time);
  const types = userSchedule.map(entry => entry.type);

  console.log("Found schedule:", { dayDates, times, types });

  res.json({
    success: true,
    dayDates,
    times,
    types
  });
});


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