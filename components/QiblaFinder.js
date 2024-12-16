import React, { useState, useEffect } from 'react';
import { Compass, MapPin } from 'lucide-react';

// Haversine and Bearing calculation functions (kept from previous implementation)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  let θ = Math.atan2(y, x);
  
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

  // Geolocation and orientation effects (kept from previous implementation)
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

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

  useEffect(() => {
    const handleOrientation = (event) => {
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

  // Detailed compass directions with precise positioning
  const compassDirections = [
    { label: 'N', degree: 0, color: 'text-red-600 font-bold' },
    { label: 'NE', degree: 45, color: 'text-gray-700' },
    { label: 'E', degree: 90, color: 'text-gray-700' },
    { label: 'SE', degree: 135, color: 'text-gray-700' },
    { label: 'S', degree: 180, color: 'text-gray-700' },
    { label: 'SW', degree: 225, color: 'text-gray-700' },
    { label: 'W', degree: 270, color: 'text-gray-700' },
    { label: 'NW', degree: 315, color: 'text-gray-700' }
  ];

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-xl font-bold mb-4 text-center flex items-center justify-center">
        <Compass className="mr-2" /> Qibla Finder
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {location && (
        <div className="space-y-3">
          {/* Enhanced Circular Compass */}
          <div className="relative w-64 h-64 mx-auto">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-8 border-gray-200 shadow-lg" />
            
            {/* Inner Precise Markings */}
            <div className="absolute inset-4 rounded-full border-2 border-gray-300" />
            
            {/* Degree Markings */}
            {[...Array(36)].map((_, i) => {
              const degree = i * 10;
              return (
                <div 
                  key={degree}
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{
                    transform: `rotate(${degree}deg)`,
                    transformOrigin: 'center'
                  }}
                >
                  <div 
                    className={`w-0.5 ${degree % 30 === 0 ? 'h-3 bg-gray-600' : 'h-1.5 bg-gray-400'}`}
                  />
                </div>
              );
            })}

            {/* Compass Directions */}
            {compassDirections.map((dir) => (
              <div 
                key={dir.label}
                className="absolute w-full h-full flex items-center justify-center"
                style={{
                  transform: `rotate(${dir.degree}deg)`,
                  transformOrigin: 'center'
                }}
              >
                <span 
                  className={`text-xs font-semibold ${dir.color}`}
                  style={{
                    transform: `rotate(-${dir.degree}deg) translate(0, -4.5rem)`
                  }}
                >
                  {dir.label}
                </span>
              </div>
            ))}

            {/* Qibla Indicator */}
            {qiblaDirection !== null && compassHeading !== null && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  transform: `rotate(${-compassHeading}deg)`,
                  transformOrigin: 'center'
                }}
              >
                {/* Qibla Arrow */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                             w-1 h-28 bg-green-500 origin-bottom rounded-full"
                  style={{
                    transform: `rotate(${qiblaDirection}deg)`,
                  }}
                />
                {/* Pivot Point */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                             w-3 h-3 bg-green-600 rounded-full"
                />
              </div>
            )}
          </div>

          {/* Compact Information Panels */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-blue-50 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <MapPin className="w-3 h-3 mr-1" />
                <span>Latitude</span>
              </div>
              <p>{location.latitude.toFixed(4)}°</p>
            </div>

            <div className="bg-green-50 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <Compass className="w-3 h-3 mr-1" />
                <span>Qibla</span>
              </div>
              <p>{qiblaDirection ? `${qiblaDirection.toFixed(2)}°` : '—'}</p>
            </div>

            <div className="bg-yellow-50 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <span className="mr-1">🕋</span>
                <span>Distance</span>
              </div>
              <p>{getDistanceToKaaba() ? `${getDistanceToKaaba()} km` : '—'}</p>
            </div>
          </div>

          {/* Alignment Indicator */}
          {compassHeading !== null && qiblaDirection !== null && (
            <div className="bg-gray-100 p-2 rounded-lg text-center text-xs">
              Alignment: {Math.abs(getQiblaAngleDifference()).toFixed(2)}° from Qibla
            </div>
          )}
        </div>
      )}

      {!location && !error && (
        <div className="text-center text-sm">Loading location...</div>
      )}
    </div>
  );
};

export default QiblaFinder;