//scheduleUtil.js

const fs = require("fs");
const path = require("path");

const schedulePath = path.join(__dirname, "..", "schedule.json");

function getUserSchedule(colleagueID, month) {
  const rawData = fs.readFileSync(schedulePath, "utf-8");
  const schedules = JSON.parse(rawData);

  const user = schedules.find(user => user.colleagueID === colleagueID);

  if (!user) {
    console.log(`Couldn't find user ID`);
    return null;
  }

  if (!user[month]) {
    console.log(`Couldn't find month specified`);
    return null;
  }

  return user[month];
}

module.exports = {
  getUserSchedule
};
