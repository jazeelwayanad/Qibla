// utils/qiblaUtils.js

export function calculateQiblaDirection(latitude, longitude) {
    const kaabaLatitude = 21.4225; // Latitude of the Kaaba
    const kaabaLongitude = 39.8262; // Longitude of the Kaaba
  
    // Convert degrees to radians
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const toDegrees = (radians) => (radians * 180) / Math.PI;
  
    // Convert coordinates to radians
    const lat1 = toRadians(latitude);
    const lon1 = toRadians(longitude);
    const lat2 = toRadians(kaabaLatitude);
    const lon2 = toRadians(kaabaLongitude);
  
    // Qibla direction formula
    const deltaLon = lon2 - lon1;
    const x = Math.cos(lat2) * Math.sin(deltaLon);
    const y =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
  
    const qiblaAngle = toDegrees(Math.atan2(x, y));
  
    // Normalize to 0-360 degrees
    return (qiblaAngle + 360) % 360;
  }
  