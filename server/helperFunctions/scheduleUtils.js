const path = require("path");
const { decryptJSONFromFile } = require("./encryptionUtils");

const scheduleFilePath = path.join(__dirname, "../schedule.json");

function getUserSchedule(colleagueID, month) {
  try {
    const schedules = decryptJSONFromFile(scheduleFilePath);
    const userSchedule = schedules.find((entry) => entry.colleagueID === colleagueID);

    if (!userSchedule || !userSchedule[month]) {
      return null;
    }

    // Add month info to each entry for frontend compatibility
    const withMonth = userSchedule[month].map((entry) => ({
      ...entry,
      month,
    }));

    return withMonth;
  } catch (err) {
    console.error("Error reading schedule data:", err);
    return null;
  }
}

module.exports = {
  getUserSchedule,
};
