import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Compass } from 'lucide-react';

// More precise geolocation and bearing calculations
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - 
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  let θ = Math.atan2(y, x);
  return (θ * 180 / Math.PI + 360) % 360;
};

const QiblaFinder = () => {
  const [location, setLocation] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [compassHeading, setCompassHeading] = useState(null);
  const [error, setError] = useState(null);
  const compassRef = useRef(null);

  // Precise Kaaba coordinates
  const KAABA_LAT = 21.422487;
  const KAABA_LON = 39.826206;

  // More robust geolocation
  useEffect(() => {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const success = (position) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });

      const direction = calculateBearing(
        latitude, longitude, 
        KAABA_LAT, KAABA_LON
      );
      setQiblaDirection(direction);
    };

    const error = (err) => {
      console.error('Geolocation error:', err);
      setError('Unable to retrieve location. Please check permissions.');
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(success, error, options);
    } else {
      setError('Geolocation not supported');
    }
  }, []);

  // Advanced orientation tracking
  useEffect(() => {
    const handleOrientation = (event) => {
      let heading;
      
      // Multiple methods for cross-browser compatibility
      if (event.webkitCompassHeading) {
        // iOS
        heading = event.webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Android and others
        heading = 360 - event.alpha;
      }

      if (heading !== undefined) {
        setCompassHeading(heading);
      }
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
    };
  }, []);

  // Calculate precise alignment
  const getQiblaAngleDifference = () => {
    if (!qiblaDirection || compassHeading === null) return null;
    
    let difference = qiblaDirection - compassHeading;
    difference = (difference + 360) % 360;
    
    return difference > 180 ? difference - 360 : difference;
  };

  // Precise distance calculation
  const getDistanceToKaaba = () => {
    if (!location) return null;
    
    return haversineDistance(
      location.latitude, 
      location.longitude, 
      KAABA_LAT, 
      KAABA_LON
    ).toFixed(2);
  };

  // Compass rotation and styling
  const compassStyle = {
    transform: `rotate(${-compassHeading}deg)`,
    transition: 'transform 0.3s ease-out'
  };

  const qiblaIndicatorStyle = {
    transform: `rotate(${qiblaDirection}deg)`,
    transition: 'transform 0.3s ease-out'
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="p-4 bg-gray-100 shadow-sm">
        <h1 className="text-xl font-bold text-center">Qibla Finder</h1>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex flex-col justify-center items-center p-4">
        {error ? (
          <div className="text-red-500 text-center">
            {error}
          </div>
        ) : !location ? (
          <div className="text-gray-500 text-center">
            Retrieving location...
          </div>
        ) : (
          <div className="w-full max-w-md">
            {/* Compass Container */}
            <div className="relative w-64 h-64 mx-auto mb-6">
              {/* Outer Compass Circle */}
              <div 
                ref={compassRef}
                className="absolute inset-0 rounded-full border-8 border-gray-200 shadow-lg"
                style={compassStyle}
              >
                {/* Compass Markings */}
                {['N', 'E', 'S', 'W'].map((direction, index) => (
                  <div 
                    key={direction}
                    className="absolute w-full h-full flex items-center justify-center"
                    style={{ 
                      transform: `rotate(${index * 90}deg)`,
                      transformOrigin: 'center'
                    }}
                  >
                    <span 
                      className={`
                        absolute text-sm font-bold 
                        ${direction === 'N' ? 'text-red-500' : 'text-gray-700'}
                      `}
                      style={{ 
                        transform: `rotate(-${index * 90}deg) translateY(-5.5rem)` 
                      }}
                    >
                      {direction}
                    </span>
                  </div>
                ))}

                {/* Qibla Indicator */}
                {qiblaDirection !== null && compassHeading !== null && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={qiblaIndicatorStyle}
                  >
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 
                                 -translate-y-1/2 w-1 h-32 bg-green-500 
                                 rounded-full shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Information Panel */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600 mb-1">Distance</div>
                <div className="font-bold">
                  {getDistanceToKaaba() ? `${getDistanceToKaaba()} km` : '—'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Qibla</div>
                <div className="font-bold">
                  {qiblaDirection ? `${qiblaDirection.toFixed(2)}°` : '—'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Alignment</div>
                <div className="font-bold">
                  {getQiblaAngleDifference() ? 
                    `${Math.abs(getQiblaAngleDifference()).toFixed(2)}°` : 
                    '—'
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="p-4 bg-gray-100 text-center text-xs text-gray-500">
        Qibla direction is approximate. Always verify with local guidance.
      </footer>
    </div>
  );
};

export default QiblaFinder;