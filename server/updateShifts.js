//updateShifts.js

const fs = require("fs");

const users = require("./schedule.json"); 

const months = {
  January: 31,
  February: 24, 
};

function generateSchedule(startOn = true, daysInMonth) {
  const schedule = [];
  let working = startOn;
  let count = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2, "0");

    schedule.push({
      date: `${dayStr}/Jan`,
      time: working ? "9:00 - 17:00" : "Not Scheduled",
      type: working ? "Home Delivery" : "",
    });

    count++;
    if (count === 2) {
      working = !working; 
      count = 0;
    }
  }

  return schedule;
}

users.forEach(user => {
  user.January = generateSchedule(user.colleagueID === "#123456", months.January);
  user.February = generateSchedule(user.colleagueID === "#123456", months.February); 
});

fs.writeFileSync("./schedule.json", JSON.stringify(users, null, 2));
console.log("Updated user schedules saved to schedule.json");
