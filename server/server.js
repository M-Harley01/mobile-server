//server.js

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const usersFilePath = path.join(__dirname, "users.json");

const { getDistance, updateServerLocation } = require("./helperFunctions/locationUtils");
const { readUserDetails, changeCheckedIn } = require("./helperFunctions/databaseUtils");
const { getUserSchedule } = require("./helperFunctions/scheduleUtils");
const { swapUser, swapColleague } = require("./helperFunctions/swapUtils");
const { timeStamp } = require("console");

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
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

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

  const distance = getDistance(serverLat, serverLon, lat2, lon2);
  console.log(`Distance calculated: ${distance} m`);

  if (distance < 100) {
    changeCheckedIn(userID);
    res.json({ success: true, distance });
  } else {
    res.json({ success: false, distance });
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

app.get("/api/profile", (req, res) => {
  const { colleagueID } = req.query;

  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ success: false, message: "Server error" });

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
        holidays: user.holidays
      });
    } else {
      res.json({ success: false, message: "User not found" });
    }
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => {
    const id = req.body.colleagueID || "unknown";
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
    cb(null, `issue_${id}_${formattedDate}_${formattedTime}.jpg`);
  }
});

const upload = multer({ storage: storage });

app.post("/api/reportIssue", upload.single("image"), (req, res) => {
  const { colleagueID, urgency, category, description } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!colleagueID || !urgency || !category || !description) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const now = new Date();
  const formattedTime = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const reportEntry = {
    colleagueID,
    description,
    urgency,
    category,
    imagePath,
    timestamp: formattedTime
  };

  const reportFilePath = path.join(__dirname, "report.json");
  let reports = [];

  try {
    if (fs.existsSync(reportFilePath)) {
      const rawData = fs.readFileSync(reportFilePath, "utf-8");
      reports = JSON.parse(rawData);
    }
    reports.push(reportEntry);
    fs.writeFileSync(reportFilePath, JSON.stringify(reports, null, 2), "utf-8");

    res.json({ success: true, message: "Issue submitted successfully", imagePath });
  } catch (error) {
    console.error("Error saving report:", error);
    res.status(500).json({ success: false, message: "Failed to save report" });
  }
});


app.get("/api/colleagues", (req, res) => {
  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ success: false, message: "Server error" });

    const users = JSON.parse(data);
    const colleagues = users.map(user => ({
      firstName: user.firstName,
      lastName: user.lastName,
      colleagueID: user.colleagueID
    }));

    res.json({ success: true, colleagues });
  });
});

app.post("/api/swapRequest", (req, res) => {
  const { from, to, swapYour, swapWith } = req.body;

  swapUser(from, to, swapYour);
  swapColleague(from, to, swapWith);

  res.json({ success: true, message: "Swap request received." });
});

app.post("/api/holidays", (req, res) => {
  const { colleagueID, start, end } = req.body;

  if (!colleagueID || !start || !end) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const monthToNumber = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  };

  try {
    const startDate = new Date(2025, monthToNumber[start.month], parseInt(start.date));
    const endDate = new Date(2025, monthToNumber[end.month], parseInt(end.date));

    if (endDate < startDate) {
      return res.status(400).json({ success: false, message: "End date cannot be before start date" });
    }

    const daysRequested = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const rawData = fs.readFileSync(usersFilePath, "utf-8");
    const users = JSON.parse(rawData);
    const user = users.find(u => u.colleagueID === colleagueID);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.holidays < daysRequested) {
      return res.status(400).json({ success: false, message: "Not enough holidays remaining" });
    }

    user.holidays -= daysRequested;
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf-8");

    console.log(`#${colleagueID} requested ${daysRequested} day(s) off`);
    console.log(`New holiday balance: ${user.holidays} days`);

    res.json({ success: true, message: `${daysRequested} holiday days deducted`, remainingHolidays: user.holidays });
  } catch (err) {
    console.error("Error processing holiday request:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
