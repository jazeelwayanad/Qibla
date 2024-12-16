import { useEffect, useState } from "react";
import Compass from "../components/Compass";
import LocationInfo from "../components/LocationInfo";
import { calculateQiblaAngle } from "../utils/qiblaUtils";

export default function Qibla() {
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [qiblaAngle, setQiblaAngle] = useState(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Fetch user's geolocation
  useEffect(() => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ lat, lon });
          setQiblaAngle(calculateQiblaAngle(lat, lon));
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation Error:", error);
          alert("Failed to fetch location. Please enable location services.");
          setLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported on this device.");
      setLoading(false);
    }
  }, []);

  // Enable Device Orientation Compass
  const enableCompass = () => {
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
      setPermissionGranted(true);
    } else {
      alert("Compass not supported on this device.");
    }
  };

  const handleOrientation = (event) => {
    setCompassHeading(event.alpha || 0); // Heading in degrees
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4 text-blue-700">Interactive Qibla Finder</h1>

      {loading ? (
        <div className="animate-spin rounded-full border-4 border-t-blue-600 h-12 w-12"></div>
) : (
        <>
          <LocationInfo location={location} qiblaAngle={qiblaAngle} />
          {!permissionGranted ? (
          <button
          onClick={enableCompass}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded transition-all"
        >
          Enable Compass
        </button>
          ) : (
            <Compass compassHeading={compassHeading} qiblaAngle={qiblaAngle} />
          )}
        </>
      )}
    </div>
  );
}
