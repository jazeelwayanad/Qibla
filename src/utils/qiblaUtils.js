export const calculateQiblaAngle = (lat, lon) => {
  const KAABA_LAT = 21.4225; // Latitude of Kaaba in Mecca
  const KAABA_LON = 39.8262; // Longitude of Kaaba in Mecca

  const deltaLon = (KAABA_LON - lon) * (Math.PI / 180); // Difference in longitude (in radians)
  const latRad = lat * (Math.PI / 180); // Latitude of user (in radians)
  const kaabaLatRad = KAABA_LAT * (Math.PI / 180); // Latitude of Kaaba (in radians)

  const y = Math.sin(deltaLon);
  const x = Math.cos(latRad) * Math.tan(kaabaLatRad) - Math.sin(latRad) * Math.cos(deltaLon);

  const angle = Math.atan2(y, x) * (180 / Math.PI); // Convert to degrees
  return (angle + 360) % 360; // Normalize angle to 0–360 degrees
};
