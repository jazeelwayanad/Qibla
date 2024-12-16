import { useState, useEffect } from 'react';
import Head from 'next/head';
import { calculateQiblaDirection } from '../utils/qiblaUtils';

export default function Home() {
  const [qiblaAngle, setQiblaAngle] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            const qiblaDirection = calculateQiblaDirection(latitude, longitude);
            setQiblaAngle(qiblaDirection);
            setError(null);
          },
          () => {
            setError('Unable to retrieve your location');
          }
        );
      } else {
        setError('Geolocation is not supported by this browser');
      }
    };

    getLocation();
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Qibla Finder</title>
      </Head>
      <main>
        <h1>Find the Qibla Direction</h1>

        {error && <p className="error">{error}</p>}

        <div className="compass-container">
          <img
            src="/compass.png" // The compass image in the public folder
            alt="Compass"
            className="compass"
            style={{
              transform: `rotate(${qiblaAngle}deg)`,
              transition: 'transform 0.5s ease-out',
            }}
          />
        </div>

        {qiblaAngle && (
          <p>
            Qibla Direction: {qiblaAngle.toFixed(2)}°
          </p>
        )}
      </main>

      <style jsx>{`
        .container {
          text-align: center;
          margin: 0 auto;
          max-width: 600px;
          padding: 20px;
        }
        h1 {
          margin: 20px 0;
        }
        .compass-container {
          display: inline-block;
          position: relative;
          width: 200px;
          height: 200px;
          margin-bottom: 20px;
        }
        .compass {
          width: 100%;
          height: 100%;
        }
        .error {
          color: red;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
}
