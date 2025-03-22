const fs = require("fs");
const path = require("path");

const schedulePath = path.join(__dirname, "..", "schedule.json");
const rawData = fs.readFileSync(schedulePath, "utf-8");
const schedules = JSON.parse(rawData);

function swapUser(from, to, swapYour) {
  const user = schedules.find(u => u.colleagueID === `#${from}`);
  const colleague = schedules.find(u => u.colleagueID === `#${to}`);

  if (!user || !colleague) {
    console.log("One or both users not found");
    return;
  }

  const { month, date } = swapYour;

  const userShifts = user[month];
  const colleagueShifts = colleague[month];

  const userIndex = userShifts?.findIndex(s => s.date === date);
  const colleagueIndex = colleagueShifts?.findIndex(s => s.date === date);

  if (userIndex === -1 || colleagueIndex === -1) {
    console.log(`One or both shifts not found for ${month} ${date}`);
    return;
  }

  console.log(`#${from} shift on ${month} ${date}:`);
  console.log(`Time: ${userShifts[userIndex].time}`);
  console.log(`Type: ${userShifts[userIndex].type}`);
  console.log("");

  console.log(`#${to} shift on ${month} ${date}:`);
  console.log(`Time: ${colleagueShifts[colleagueIndex].time}`);
  console.log(`Type: ${colleagueShifts[colleagueIndex].type}`);
  console.log("");

  const temp = { ...userShifts[userIndex] }; 

  userShifts[userIndex] = { ...colleagueShifts[colleagueIndex] };
  colleagueShifts[colleagueIndex] = temp;

  fs.writeFileSync(schedulePath, JSON.stringify(schedules, null, 2), "utf-8");
  console.log(`🔁 Shift on ${month} ${date} swapped between #${from} and #${to}`);
}

function swapColleague(from, to, swapWith){
    const user = schedules.find(u => u.colleagueID === `#${from}`);
  const colleague = schedules.find(u => u.colleagueID === `#${to}`);

  if (!user || !colleague) {
    console.log("One or both users not found");
    return;
  }

  const { month, date } = swapWith;

  const userShifts = user[month];
  const colleagueShifts = colleague[month];

  const userIndex = userShifts?.findIndex(s => s.date === date);
  const colleagueIndex = colleagueShifts?.findIndex(s => s.date === date);

  if (userIndex === -1 || colleagueIndex === -1) {
    console.log(`One or both shifts not found for ${month} ${date}`);
    return;
  }

  console.log(`#${from} shift on ${month} ${date}:`);
  console.log(`Time: ${userShifts[userIndex].time}`);
  console.log(`Type: ${userShifts[userIndex].type}`);
  console.log("");

  console.log(`#${to} shift on ${month} ${date}:`);
  console.log(`Time: ${colleagueShifts[colleagueIndex].time}`);
  console.log(`Type: ${colleagueShifts[colleagueIndex].type}`);
  console.log("");

  const temp = { ...userShifts[userIndex] }; 

  userShifts[userIndex] = { ...colleagueShifts[colleagueIndex] };
  colleagueShifts[colleagueIndex] = temp;

  fs.writeFileSync(schedulePath, JSON.stringify(schedules, null, 2), "utf-8");
  console.log(`Shift on ${month} ${date} swapped between #${from} and #${to}`);
}

module.exports = {
  swapUser,
  swapColleague
};
