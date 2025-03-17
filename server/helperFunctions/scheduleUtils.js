//scheduleUtil.js

const fs = require("fs");

const rawData = fs.readFileSync("schedule.json");
const schedules = JSON.parse(rawData);

function getUserSchedule(colleagueID, month) {
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
