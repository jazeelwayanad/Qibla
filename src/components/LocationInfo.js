export default function LocationInfo({ location, qiblaAngle }) {
    return (
      <div className="text-center mb-4">
        {location.lat && location.lon ? (
          <>
            <p className="text-lg text-gray-700">
              Your Location:{" "}
              <span className="font-semibold">
                {location.lat.toFixed(5)}, {location.lon.toFixed(5)}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Qibla Angle:{" "}
              <span className="font-semibold">{qiblaAngle.toFixed(2)}°</span>
            </p>
          </>
        ) : (
          <p className="text-lg text-red-500">Unable to fetch location.</p>
        )}
      </div>
    );
  }
  