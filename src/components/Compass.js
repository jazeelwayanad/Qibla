import styles from "../styles/qibla.module.css";

export default function Compass({ compassHeading, qiblaAngle }) {
  const rotation = compassHeading - qiblaAngle;

  return (
    <div className={styles.compassContainer}>
      {/* Red Compass Pointer */}
      <div
        className={styles.redPointer}
        style={{ transform: `rotate(${rotation}deg)` }}
      ></div>

      {/* Qibla Green Indicator */}
      <div className={styles.qiblaIndicator}></div>

      {/* Instructions */}
      <p className="mt-4 text-center text-gray-700">
        Align the red pointer with the green line to face Qibla.
      </p>
    </div>
  );
}
