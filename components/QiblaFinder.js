import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Target 
} from 'lucide-react';

const QiblaFinder = () => {
  const [location, setLocation] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [accuracy, setAccuracy] = useState(null);

  // Mecca coordinates (fixed reference point)
  const MECCA_LATITUDE = 21.4225;
  const MECCA_LONGITUDE = 39.8262;

  // Calculate Qibla direction using spherical trigonometry
  const calculateQiblaDirection = (lat1, lon1) => {
    const lat1Rad = lat1 * (Math.PI / 180);
    const lon1Rad = lon1 * (Math.PI / 180);
    const mechaLatRad = MECCA_LATITUDE * (Math.PI / 180);
    const mechaLonRad = MECCA_LONGITUDE * (Math.PI / 180);

    const y = Math.sin(mechaLonRad - lon1Rad) * Math.cos(mechaLatRad);
    const x = Math.cos(lat1Rad) * Math.sin(mechaLatRad) - 
              Math.sin(lat1Rad) * Math.cos(mechaLatRad) * 
              Math.cos(mechaLonRad - lon1Rad);
    
    let bearingRad = Math.atan2(y, x);
    let bearingDeg = bearingRad * (180 / Math.PI);
    
    // Normalize to 0-360 degrees
    bearingDeg = (bearingDeg + 360) % 360;
    return bearingDeg;
  };

  // Request location permission and set up compass tracking
  useEffect(() => {
    const requestLocationAndCompass = async () => {
      try {
        // Request location
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });

        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ latitude, longitude });
        setAccuracy(accuracy);

        // Calculate Qibla direction
        const direction = calculateQiblaDirection(latitude, longitude);
        setQiblaDirection(direction);

        // Set up compass tracking
        if ('DeviceOrientationEvent' in window) {
          window.addEventListener('deviceorientationabsolute', handleOrientation, false);
        }
      } catch (error) {
        console.error("Location access denied:", error);
      }
    };

    requestLocationAndCompass();

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
    };
  }, []);

  // Handle device orientation
  const handleOrientation = (event) => {
    let heading;
    if (event.webkitCompassHeading) {
      // iOS
      heading = event.webkitCompassHeading;
    } else if (event.absolute && event.alpha !== null) {
      // Android and others
      heading = 360 - event.alpha;
    }
    
    setCompassHeading(heading);
  };

  // Compass component
  const CompassDisplay = () => {
    const rotationAngle = qiblaDirection ? 
      (360 - compassHeading + qiblaDirection) % 360 : 
      0;

    return (
      <div className="relative w-64 h-64 mx-auto">
        {/* Compass background circle */}
        <div className="absolute inset-0 bg-gray-100 rounded-full border-4 border-gray-300 shadow-lg"></div>
        
        {/* Compass dial */}
        <div 
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={{ transform: `rotate(${rotationAngle}deg)` }}
        >
          {/* Qibla direction indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-1/2 bg-green-500 z-10"></div>
          
          {/* Compass markings */}
          {['N', 'E', 'S', 'W'].map((direction, index) => (
            <div 
              key={direction} 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-600"
              style={{ 
                transform: `rotate(${index * 90}deg) translate(0, -120px) rotate(-${index * 90}deg)` 
              }}
            >
              {direction}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-4 text-center flex items-center justify-center">
        <Compass className="mr-2" /> Qibla Finder
      </h1>
      
      {/* Compass Display */}
      <CompassDisplay />
      
      {/* Location and Qibla Information */}
      <div className="mt-4 text-center">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-center">
            <MapPin className="mr-1 text-blue-500" size={16} />
            <span>
              {location 
                ? `Lat: ${location.latitude.toFixed(4)}° 
                   Lon: ${location.longitude.toFixed(4)}°`
                : 'Locating...'}
            </span>
          </div>
          
          <div className="flex items-center justify-center">
            <Navigation className="mr-1 text-green-500" size={16} />
            <span>
              {qiblaDirection 
                ? `${qiblaDirection.toFixed(2)}°` 
                : 'Calculating...'}
            </span>
          </div>
          
          <div className="flex items-center justify-center">
            <Target className="mr-1 text-red-500" size={16} />
            <span>
              {accuracy 
                ? `Accuracy: ${accuracy.toFixed(0)}m` 
                : 'Checking...'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        Ensure location services are enabled for accurate results
      </p>
    </div>
  );
};

export default QiblaFinder;