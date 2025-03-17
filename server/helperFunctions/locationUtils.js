//locationUtils.js

const axios = require("axios");

let lat = null;
let lon = null;

async function getServerLocation() {
  try {
    const response = await axios.get("http://ip-api.com/json/");
    lat = response.data.lat;
    lon = response.data.lon;
    console.log(`(Lat: ${lat}, Lon: ${lon})`);
    return { lat, lon };
  } catch (error) {
    console.error("Error fetching server location:", error);
  }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {

  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    console.error("Invalid coordinates provided for distance calculation.");
    return null;
  }

  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = {
  getServerLocation,
  getDistanceFromLatLonInKm,
  getLat: () => lat,
  getLon: () => lon  
};
