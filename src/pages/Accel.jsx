import { useRef, useState } from "react";
import { BASE_URL } from "../api/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export default function Accel() {
  function getDeviceId() {
    let id = localStorage.getItem("device_id");

    if (!id) {
      id = "dev-" + crypto.randomUUID();
      localStorage.setItem("device_id", id);
    }

    return id;
  }
  const [data, setData] = useState([]);
  const [running, setRunning] = useState(false);
  const [shake, setShake] = useState(false);
  const deviceId = getDeviceId();
  const sensorRef = useRef(null);
  const lastSendRef = useRef(0);

  const startSensor = () => {
    if (running) return;

    setRunning(true);

    const handler = async (e) => {
      const x = e.accelerationIncludingGravity?.x || 0;
      const y = e.accelerationIncludingGravity?.y || 0;
      const z = e.accelerationIncludingGravity?.z || 0;

      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (magnitude > 20) {
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }

      const newPoint = {
        t: Date.now(),
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        z: Number(z.toFixed(2)),
      };

      setData((prev) => {
        const updated = [...prev, newPoint];

        if (updated.length > 40) updated.shift();

        return updated;
      });

      const now = Date.now();

      if (now - lastSendRef.current > 300) {
        lastSendRef.current = now;

        await fetch(`${BASE_URL}?path=telemetry/accel`, {
          method: "POST",
          body: JSON.stringify({
            device_id: deviceId,
            ts: new Date().toISOString(),
            samples: [{ t: new Date().toISOString(), x, y, z }],
          }),
        });
      }
    };

    sensorRef.current = handler;

    window.addEventListener("devicemotion", handler);
  };

  const stopSensor = () => {
    if (sensorRef.current) {
      window.removeEventListener("devicemotion", sensorRef.current);
      sensorRef.current = null;
    }

    setRunning(false);
  };

  return (
    <div style={wrapper}>
      <div className="card" style={cardStyle}>
        <h2>Accelerometer Monitor</h2>

        <p style={{ marginBottom: 20, color: "#64748b" }}>Grafik realtime pergerakan perangkat</p>

        <div style={buttonRow}>
          <button onClick={startSensor} disabled={running}>
            Start Sensor
          </button>

          <button onClick={stopSensor} style={{ background: "#ef4444" }} disabled={!running}>
            Stop Sensor
          </button>
        </div>

        {shake && <div style={shakeBox}>⚡ Device Shake Detected</div>}

        <Chart title="X Axis" data={data} dataKey="x" color="#6366f1" />
        <Chart title="Y Axis" data={data} dataKey="y" color="#10b981" />
        <Chart title="Z Axis" data={data} dataKey="z" color="#ef4444" />
      </div>
    </div>
  );
}

function Chart({ title, data, dataKey, color }) {
  return (
    <div style={{ height: 180, marginTop: 25 }}>
      <h4 style={{ marginBottom: 5 }}>{title}</h4>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="t" tick={false} />

          <YAxis domain={[-20, 20]} />

          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* STYLE */

const wrapper = {
  display: "flex",
  justifyContent: "center",
  minHeight: "70vh",
};

const cardStyle = {
  width: "100%",
  maxWidth: 900,
};

const buttonRow = {
  display: "flex",
  gap: 10,
};

const shakeBox = {
  marginTop: 15,
  background: "#fef3c7",
  padding: 10,
  borderRadius: 8,
  color: "#92400e",
};
