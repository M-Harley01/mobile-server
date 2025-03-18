//locationUtils.js

const axios = require("axios");

var lat;
var lon;

function updateServerLocation(newLat, newLon){
  lat = newLat;
  lon = newLon;
  console.log(`updated location Lat: ${lat}, lon: ${lon}`)
}

function getDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    console.error("Invalid coordinates provided for distance calculation.");
    return null;
  }

  const latDiff = (lat2 - lat1) * 111320; 
  const lonDiff = (lon2 - lon1) * (111320 * Math.cos(deg2rad(lat1)));

  return Math.sqrt(latDiff ** 2 + lonDiff ** 2);
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = {
  updateServerLocation,
  getDistance,
  getLat: () => lat,
  getLon: () => lon  
};
