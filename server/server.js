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

let users = [];

function readUserDetails(){

  try{
    const rawData = fs.readFileSync("users.json");
    users = JSON.parse(rawData);
    console.log("user data succesfully gatherered");
  }catch(err){
    console.log("user data unable to be loaded", err);
  }
}

readUserDetails();

//allows a user to log in
app.post("/api/receive", (req, res) => {
  const { colleagueID, password } = req.body; 

    const user = users.find(user => user.colleagueID === colleagueID && user.password === password);

    if (user) {
      console.log("User credentials match");
      res.json({ success: true});
    } else {
      console.log("Incorrect colleague ID or password");
      res.json({ success: false, message: "Incorrect ID or password" });
    }
});

app.get("/api/profile", (req,res) => {
  const { colleagueID } = req.query;

  const user = users.find(user => user.colleagueID === colleagueID);

  if(user){
    const responseData = {
      success: true,
      firstName: user.firstName,
      lastName: user.lastName,
      contactNo: user.contactNo,
      position: user.position,
      location: user.location
    };
    console.log("Sending response:", responseData);
    res.json(responseData);
  }else{
    res.json({ success: false, message: "User not found" });
  }
});

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); 
  },
});

const upload = multer({ storage: storage });

app.post("/api/image", upload.single("image"),(req,res) => {
  if(!req.file){
    return res.status(400).json({ success: false, message: "No image uploaded" });
  }

  console.log("image recieved", req.file.path);

  res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    filePath: req.file.path, 
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});