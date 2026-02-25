import { useState } from "react";
import { BASE_URL } from "../api/api";

export default function Accel() {
  const [d, setD] = useState({ x: 0, y: 0, z: 0 });

  const startSensor = () => {
    window.addEventListener("devicemotion", async (e) => {
      const x = e.accelerationIncludingGravity?.x || 0;
      const y = e.accelerationIncludingGravity?.y || 0;
      const z = e.accelerationIncludingGravity?.z || 0;

      setD({ x, y, z });

      await fetch(`${BASE_URL}?path=telemetry/accel`, {
        method: "POST",
        body: JSON.stringify({
          device_id: "dev-001",
          ts: new Date().toISOString(),
          samples: [{ t: new Date().toISOString(), x, y, z }],
        }),
      });
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Accelerometer</h2>

      <button onClick={startSensor}>Aktifkan Sensor</button>

      <p>X: {d.x.toFixed(2)}</p>
      <p>Y: {d.y.toFixed(2)}</p>
      <p>Z: {d.z.toFixed(2)}</p>
    </div>
  );
}
