import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Compass } from 'lucide-react';

// Precise Haversine distance calculation
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in meters
};

// Precise bearing calculation (great-circle method)
const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - 
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  let θ = Math.atan2(y, x);
  const bearing = (θ * 180 / Math.PI + 360) % 360;
  return bearing;
};

const QiblaFinder = () => {
  const [location, setLocation] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [compassHeading, setCompassHeading] = useState(null);
  const [error, setError] = useState(null);
  const compassRef = useRef(null);

  // Coordinates of the Kaaba in Mecca (more precise)
  const KAABA_LAT = 21.422487;
  const KAABA_LON = 39.826206;

  // Enhanced geolocation with higher accuracy
  useEffect(() => {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ 
          latitude, 
          longitude, 
          accuracy: position.coords.accuracy 
        });

        // Calculate Qibla direction with high precision
        const direction = calculateBearing(
          latitude, 
          longitude, 
          KAABA_LAT, 
          KAABA_LON
        );
        setQiblaDirection(direction);
      },
      (err) => {
        setError(`Location error: ${err.message}`);
      },
      options
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Advanced device orientation handling
  useEffect(() => {
    const handleOrientation = (event) => {
      let heading;
      
      // Multiple methods to get compass heading
      if (event.webkitCompassHeading) {
        // iOS
        heading = event.webkitCompassHeading;
      } else if (event.compassHeading) {
        // Some Android devices
        heading = event.compassHeading;
      } else if (event.alpha !== null) {
        // Fallback for devices without dedicated compass
        heading = 360 - event.alpha;
      }

      // Normalize heading
      heading = (heading + 360) % 360;
      setCompassHeading(heading);
    };

    // Check for device orientation support
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
      
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    } else {
      setError('Device orientation not supported');
    }
  }, []);

  // Calculate angle difference for precise alignment
  const getQiblaAngleDifference = () => {
    if (!qiblaDirection || compassHeading === null) return null;
    
    let difference = qiblaDirection - compassHeading;
    difference = ((difference + 360) % 360 + 360) % 360;
    
    return difference > 180 ? difference - 360 : difference;
  };

  // Calculate distance with meter precision
  const getDistanceToKaaba = () => {
    if (!location) return null;
    
    const distanceMeters = haversineDistance(
      location.latitude, 
      location.longitude, 
      KAABA_LAT, 
      KAABA_LON
    );

    // Convert to kilometers with 2 decimal places
    return (distanceMeters / 1000).toFixed(2);
  };

  // Render compass rotation
  const getCompassRotation = () => {
    if (compassHeading === null || qiblaDirection === null) return 0;
    
    // Rotate so that Qibla direction is at the top
    return -(compassHeading - qiblaDirection);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center">
          <Compass className="mr-2" /> Qibla Finder
        </h1>
        <MapPin className="text-white" />
      </div>

      {/* Error Handling */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      )}

      {/* Compass Container */}
      <div className="p-6 bg-gray-50">
        {/* Compass Visualization */}
        <div 
          ref={compassRef}
          className="relative w-64 h-64 mx-auto"
        >
          {/* Outer Circle */}
          <div 
            className="absolute inset-0 rounded-full border-8 border-blue-100 
                       shadow-lg transform transition-transform duration-300"
            style={{
              transform: `rotate(${getCompassRotation()}deg)`
            }}
          >
            {/* Cardinal Directions */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-red-600 font-bold">N</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">S</div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2">W</div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2">E</div>

            {/* Qibla Indicator */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 
                         w-2 h-1/2 bg-green-500 origin-bottom rounded-t-full"
            />
          </div>

          {/* Compass Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                          w-4 h-4 bg-blue-600 rounded-full z-10" />
        </div>
      </div>

      {/* Location & Qibla Information */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-white">
        <div className="text-center">
          <p className="text-sm text-gray-600">Distance to Kaaba</p>
          <p className="font-bold text-blue-600">
            {getDistanceToKaaba() ? `${getDistanceToKaaba()} km` : '—'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Qibla Direction</p>
          <p className="font-bold text-green-600">
            {qiblaDirection ? `${qiblaDirection.toFixed(2)}°` : '—'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QiblaFinder;