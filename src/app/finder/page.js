"use client"
import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

// Coordinates of the Kaaba in Mecca
const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;

const QiblaFinder = () => {
  const [location, setLocation] = useState(null);
  const [qiblaAngle, setQiblaAngle] = useState(null);
  const [compassHeading, setCompassHeading] = useState(null);
  const [error, setError] = useState(null);

  // Calculate Qibla direction using great-circle formula
  const calculateQiblaDirection = (lat1, lon1) => {
    // Convert degrees to radians
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    
    const φ1 = toRadians(lat1);
    const λ1 = toRadians(lon1);
    const φ2 = toRadians(KAABA_LATITUDE);
    const λ2 = toRadians(KAABA_LONGITUDE);
    
    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - 
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    
    let θ = Math.atan2(y, x);
    // Convert back to degrees
    let qiblaDirection = (θ * 180 / Math.PI + 360) % 360;
    
    return qiblaDirection;
  };

  // Get user's current location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        
        // Calculate Qibla direction
        const direction = calculateQiblaDirection(latitude, longitude);
        setQiblaAngle(direction);
      },
      (err) => {
        setError(`Error: ${err.message}`);
      }
    );
  };

  // Handle device orientation changes
  const handleOrientation = (event) => {
    // Normalize compass heading
    let heading = event.webkitCompassHeading || event.alpha;
    
    // Some devices return alpha instead of compass heading
    if (heading === null) {
      // This is a fallback and may not be as accurate
      heading = event.alpha;
    }
    
    // Normalize heading to 0-360 degrees
    heading = (360 - heading) % 360;
    setCompassHeading(heading);
  };

  // Request device orientation permissions and add event listeners
  useEffect(() => {
    // First, get location
    getLocation();

    // Then set up device orientation
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ requires explicit permission
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      // For other browsers
      window.addEventListener('deviceorientation', handleOrientation);
    }

    // Cleanup
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Calculate rotation angle for Qibla indicator
  const getRotationAngle = () => {
    if (compassHeading === null || qiblaAngle === null) return 0;
    
    // Difference between compass heading and Qibla direction
    return qiblaAngle - compassHeading;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Qibla Finder</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {location && (
          <div className="mb-4">
            <p className="text-gray-600">
              Your Location: {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
            </p>
            <p className="text-gray-600">
              Qibla Direction: {qiblaAngle ? qiblaAngle.toFixed(2):0}°
            </p>
          </div>
        )}
        
        <div className="relative w-64 h-64 mx-auto my-4">
          {/* Compass Background */}
          <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
          
          {/* Compass Indicator */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `rotate(${getRotationAngle()}deg)`,
              transition: 'transform 0.3s ease'
            }}
          >
            <Compass 
              size={256} 
              className="text-blue-600"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
            
            {/* Qibla Indicator */}
            <div 
              className="absolute w-2 h-32 bg-green-500"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-90deg)'
              }}
            ></div>
          </div>
        </div>
        
        <button 
          onClick={getLocation} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Refresh Location
        </button>
      </div>
    </div>
  );
};

export default QiblaFinder;