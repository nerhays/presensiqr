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
    <div style={wrapper}>
      <div className="card" style={cardStyle}>
        <h2>Accelerometer</h2>

        <button onClick={startSensor} style={{ marginBottom: 25 }}>
          Aktifkan Sensor
        </button>

        <div style={grid}>
          <Stat label="X" value={d.x} />
          <Stat label="Y" value={d.y} />
          <Stat label="Z" value={d.z} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={statBox}>
      <p>{label}</p>
      <h3>{value.toFixed(2)}</h3>
    </div>
  );
}

const wrapper = {
  display: "flex",
  justifyContent: "center",
  minHeight: "70vh",
};

const cardStyle = {
  width: "100%",
  maxWidth: 800,
};

const grid = {
  display: "flex",
  gap: 20,
};

const statBox = {
  flex: 1,
  background: "#f1f5f9",
  padding: 20,
  borderRadius: 12,
  textAlign: "center",
};