import React, { useState, useEffect } from 'react';
import { Compass, MapPin, AlertTriangle } from 'lucide-react';

// Haversine formula to calculate distance between two coordinates
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate bearing (direction) between two coordinates
const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  let θ = Math.atan2(y, x);
  
  // Convert to degrees and normalize to 0-360
  const bearing = (θ * 180 / Math.PI + 360) % 360;
  return bearing;
};

const QiblaFinder = () => {
  const [location, setLocation] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [compassHeading, setCompassHeading] = useState(null);
  const [error, setError] = useState(null);

  // Coordinates of the Kaaba in Mecca
  const KAABA_LAT = 21.4225;
  const KAABA_LON = 39.8262;

  // Request geolocation permission and get current location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          // Calculate Qibla direction
          const direction = calculateBearing(
            latitude, 
            longitude, 
            KAABA_LAT, 
            KAABA_LON
          );
          setQiblaDirection(direction);
        },
        (err) => {
          setError('Unable to retrieve location: ' + err.message);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  }, []);

  // Listen for device orientation changes
  useEffect(() => {
    const handleOrientation = (event) => {
      // Different browser support for orientation
      const heading = event.webkitCompassHeading || 
                      event.compassHeading || 
                      360 - event.alpha;
      
      setCompassHeading(heading);
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Calculate angle difference for Qibla alignment
  const getQiblaAngleDifference = () => {
    if (!qiblaDirection || compassHeading === null) return null;
    
    let difference = qiblaDirection - compassHeading;
    // Normalize to 0-360 range
    difference = (difference + 360) % 360;
    
    return difference;
  };

  // Calculate distance to Kaaba
  const getDistanceToKaaba = () => {
    if (!location) return null;
    
    return haversineDistance(
      location.latitude, 
      location.longitude, 
      KAABA_LAT, 
      KAABA_LON
    ).toFixed(2);
  };

  // Render component
  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center flex items-center justify-center">
        <Compass className="mr-2" /> Qibla Finder
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <AlertTriangle className="inline mr-2" />
          {error}
        </div>
      )}

      {location && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2 flex items-center">
              <MapPin className="mr-2" /> Current Location
            </h2>
            <p>Latitude: {location.latitude.toFixed(4)}</p>
            <p>Longitude: {location.longitude.toFixed(4)}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Qibla Information</h2>
            <p>Direction to Kaaba: {qiblaDirection ? `${qiblaDirection.toFixed(2)}°` : 'Calculating...'}</p>
            <p>Distance to Kaaba: {getDistanceToKaaba() ? `${getDistanceToKaaba()} km` : 'Calculating...'}</p>
          </div>

          {compassHeading !== null && qiblaDirection !== null && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="font-semibold mb-2">Alignment</h2>
              <div className="flex items-center">
                <div 
                  className="w-full h-8 bg-blue-200 relative"
                  style={{
                    transform: `rotate(${getQiblaAngleDifference()}deg)`,
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-full bg-blue-600"
                  />
                </div>
                <span className="ml-2">
                  {Math.abs(getQiblaAngleDifference()).toFixed(2)}° from Qibla
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {!location && !error && (
        <div className="text-center">
          <p>Loading location...</p>
        </div>
      )}
    </div>
  );
};

export default QiblaFinder;