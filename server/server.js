//server.js

const express = require("express");
const cors = require("cors");

const { getDistance, lat, lon, updateServerLocation } = require("./helperFunctions/locationUtils");
const { readDatabase, setMap, readUserDetails, mappedDetails } = require("./helperFunctions/databaseUtils");
const { getUserSchedule } = require("./helperFunctions/scheduleUtils");

const app = express();
const PORT = 3000;

var serverLat; 
var serverLon;

console.log(`server manually set to: lat=${serverLat} lon=${serverLon}`);

const corsOptions = {
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type",
};

app.use(cors(corsOptions));
app.use(express.json());

const users = readUserDetails();

app.post("/api/setLocation", (req, res) => {
  const { lat, lon } = req.body;

  if( !lat || !lon ){
    return res.status(400).json({success: false, message: "latitude or longatude are missing" });
  }

  serverLat = lat;
  serverLon = lon;

  updateServerLocation(serverLat, serverLon);
  console.log(`workplace location set: lat=${serverLat} lon=${serverLon}`)

  res.json({success: true, message: "server location updated"});
});

app.get("/api/location", (req, res) => {
  let lat2 = parseFloat(req.query.lat2);
  let lon2 = parseFloat(req.query.lon2);

  if (!lat2 || !lon2) {
    return res.status(400).json({ success: false, message: "Invalid latitude or longitude received" });
  }

  console.log(`mobile lon=${lon2} lat=${lat2}`)

  const distance = getDistance(serverLat, serverLon, lat2, lon2);

  console.log(`Distance calculated: ${distance} m`);

  res.json({ success: true, distance });
});

app.get("/api/schedule", (req, res) => {
  let { colleagueID, month } = req.query;

  if (!colleagueID || !month) {
    return res.status(400).json({ success: false, message: "Missing colleagueID or month" });
  }

  if (!colleagueID.startsWith('#')) {
    colleagueID = `#${colleagueID}`;
  }

  const userSchedule = getUserSchedule(colleagueID, month);

  if (!userSchedule) {
    return res.json({ success: false, message: "Schedule not found" });
  }

  const dayDates = userSchedule.map(entry => entry.date);
  const times = userSchedule.map(entry => entry.time);
  const types = userSchedule.map(entry => entry.type);

  res.json({ success: true, dayDates, times, types });
});

app.post("/api/receive", (req, res) => {
  const { colleagueID, password } = req.body;

  const user = users.find(user => user.colleagueID === colleagueID && user.password === password);

  if (user) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Incorrect ID or password" });
  }
});

app.get("/api/profile", (req, res) => {
  const { colleagueID } = req.query;
  const user = users.find(user => user.colleagueID === colleagueID);

  if (user) {
    res.json({
      success: true,
      firstName: user.firstName,
      lastName: user.lastName,
      contactNo: user.contactNo,
      position: user.position,
      location: user.location
    });
  } else {
    res.json({ success: false, message: "User not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
