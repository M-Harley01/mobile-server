//server.js

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const usersFilePath = path.join(__dirname, "users.json");

const { getDistance, updateServerLocation } = require("./helperFunctions/locationUtils");
const { readUserDetails, changeCheckedIn } = require("./helperFunctions/databaseUtils");
const { getUserSchedule } = require("./helperFunctions/scheduleUtils");

const app = express();
const PORT = 3000;

let serverLat = null;
let serverLon = null;

const corsOptions = {
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images

const users = readUserDetails();

app.post("/api/setLocation", (req, res) => {
  const { lat, lon } = req.body;

  if (!lat || !lon) {
    return res.status(400).json({ success: false, message: "Latitude or longitude is missing" });
  }

  serverLat = lat;
  serverLon = lon;

  updateServerLocation(serverLat, serverLon);
  console.log(`Workplace location set: lat=${serverLat}, lon=${serverLon}`);

  res.json({ success: true, message: "Server location updated" });
});

app.get("/api/location", (req, res) => {
  let userID = req.query.userID;
  let lat2 = parseFloat(req.query.lat2);
  let lon2 = parseFloat(req.query.lon2);

  if (!userID || !lat2 || !lon2) {
    return res.status(400).json({ success: false, message: "Invalid latitude or longitude received" });
  }

  console.log(`user trying to check in: ` + userID);
  console.log(`Server Location: lat=${serverLat}, lon=${serverLon}`);
  console.log(`Device Location: lat=${lat2}, lon=${lon2}`);

  const distance = getDistance(serverLat, serverLon, lat2, lon2);
  console.log(`Distance calculated: ${distance} m`);

  if(distance < 100){
    changeCheckedIn(userID);
    res.json({ success: true, distance });
  }else{
    res.json({success: false, distance});
  }
});

app.post("/api/checkout", (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading users file:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    let users = JSON.parse(data);
    let user = users.find((u) => u.colleagueID === userID);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.checkedIn = false; 

    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), "utf8", (err) => {
      if (err) {
        console.error("Error writing users file:", err);
        return res.status(500).json({ success: false, message: "Failed to update user status" });
      }
      console.log(`User ${userID} successfully checked out`);
      res.json({ success: true });
    });
  });
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

const fs = require("fs");

app.get("/api/profile", (req, res) => {
  const { colleagueID } = req.query;

  fs.readFile("users.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading user data:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    const users = JSON.parse(data);
    const user = users.find(user => user.colleagueID === colleagueID);

    if (user) {
      res.json({
        success: true,
        firstName: user.firstName,
        lastName: user.lastName,
        contactNo: user.contactNo,
        position: user.position,
        location: user.location,
        checkedIn: user.checkedIn, 
      });
    } else {
      res.json({ success: false, message: "User not found" });
    }
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/api/reportIssue", upload.single("image"), (req, res) => {
  const { colleagueID, urgency, category, description } = req.body;
  let imagePath = null;

  if (!colleagueID || !urgency || !category || !description) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
  }

  console.log("New issue reported: ", { colleagueID, urgency, category, description, imagePath });

  res.json({ success: true, message: "Issue submitted successfully", imagePath });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
