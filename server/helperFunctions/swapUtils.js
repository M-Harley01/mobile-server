// swapUtils.js
const { decryptJSONFromFile, encryptJSONToFile } = require("./encryptionUtils");
const path = require("path");

const scheduleFilePath = path.join(__dirname, "../schedule.json");

function swapUser(userID, colleagueID, yourShift) {
  const schedules = decryptJSONFromFile(scheduleFilePath);
  const { month, date } = yourShift;

  const user = schedules.find(u => u.colleagueID === `#${userID}`);
  const colleague = schedules.find(u => u.colleagueID === `#${colleagueID}`);

  if (!user || !colleague) return;

  const paddedDate = String(date).padStart(2, "0");
  const userDay = user[month]?.find(entry => entry.date === paddedDate);
  const colDay = colleague[month]?.find(entry => entry.date === paddedDate);

  console.log("[swapUser] Swapping shift on:", yourShift);
  console.log("[swapUser] User Day (before):", userDay);
  console.log("[swapUser] Colleague Day (before):", colDay);

  if (userDay && colDay) {
    const temp = { ...userDay };
    Object.assign(userDay, colDay);
    Object.assign(colDay, temp);

    console.log("[swapUser] User Day (after):", userDay);
    console.log("[swapUser] Colleague Day (after):", colDay);

    encryptJSONToFile(scheduleFilePath, schedules);
  }
}

function swapColleague(userID, colleagueID, theirShift) {
  const schedules = decryptJSONFromFile(scheduleFilePath);
  const { month, date } = theirShift;

  const user = schedules.find(u => u.colleagueID === `#${userID}`);
  const colleague = schedules.find(u => u.colleagueID === `#${colleagueID}`);

  if (!user || !colleague) return;

  const paddedDate = String(date).padStart(2, "0");
  const userDay = user[month]?.find(entry => entry.date === paddedDate);
  const colDay = colleague[month]?.find(entry => entry.date === paddedDate);

  console.log("[swapColleague] Swapping shift on:", theirShift);
  console.log("[swapColleague] User Day (before):", userDay);
  console.log("[swapColleague] Colleague Day (before):", colDay);

  if (userDay && colDay) {
    const temp = { ...userDay };
    Object.assign(userDay, colDay);
    Object.assign(colDay, temp);

    console.log("[swapColleague] User Day (after):", userDay);
    console.log("[swapColleague] Colleague Day (after):", colDay);

    encryptJSONToFile(scheduleFilePath, schedules);
  }
}

module.exports = {
  swapUser,
  swapColleague,
};
