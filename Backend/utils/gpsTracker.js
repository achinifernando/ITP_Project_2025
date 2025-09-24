// utils/gpsTracker.js
const websocketServer = require("../websocket");

// Simulate GPS tracking updates
function simulateGPSUpdate(deliveryId, driverId) {
  const locations = [
    { lat: 6.9271, lng: 79.8612 }, // Colombo
    { lat: 6.9275, lng: 79.8615 },
    { lat: 6.9280, lng: 79.8620 },
    { lat: 6.9285, lng: 79.8625 },
    { lat: 6.9290, lng: 79.8630 }
  ];

  let index = 0;
  
  const interval = setInterval(() => {
    if (index < locations.length) {
      const location = locations[index];
      
      // Broadcast via WebSocket
      websocketServer.broadcastLocationUpdate(deliveryId, location, driverId);
      
      console.log(`GPS Update for delivery ${deliveryId}:`, location);
      index++;
    } else {
      clearInterval(interval);
      console.log(`GPS simulation completed for delivery ${deliveryId}`);
    }
  }, 5000); // Update every 5 seconds

  return interval;
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  return distance;
}

// Generate random location near a point (for testing)
function generateRandomLocation(centerLat, centerLng, radiusKm = 0.1) {
  const radiusInDegrees = radiusKm / 111;
  
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  
  const newX = x / Math.cos(centerLat * Math.PI / 180);
  const newLat = centerLat + y;
  const newLng = centerLng + newX;
  
  return {
    lat: parseFloat(newLat.toFixed(6)),
    lng: parseFloat(newLng.toFixed(6))
  };
}

module.exports = {
  simulateGPSUpdate,
  calculateDistance,
  generateRandomLocation
};