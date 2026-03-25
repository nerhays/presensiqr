import { useEffect, useState } from "react";
import { BASE_URL } from "../api/api";

export default function AccelMonitor() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BASE_URL}?path=telemetry/accel/all`);
        const json = await res.json();

        if (json.ok) {
          setDevices(json.data.items);
        }
      } catch (err) {
        console.log("error fetch accel:", err);
      }
    }, 1000); // realtime 1 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={wrapper}>
      <div style={card}>
        <h2>📊 Monitoring Accelerometer</h2>

        <p style={subtitle}>Data realtime pergerakan mahasiswa</p>

        {devices.length === 0 && <p style={{ color: "#64748b" }}>Tidak ada data...</p>}

        <div style={grid}>
          {devices.map((d) => {
            const magnitude = Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z);

            const isShake = magnitude > 20;

            return (
              <div
                key={d.device_id}
                style={{
                  ...deviceCard,
                  border: isShake ? "2px solid #f59e0b" : "1px solid #e5e7eb",
                  background: isShake ? "#fffbeb" : "white",
                }}
              >
                <h4>📱 {d.device_id}</h4>

                <p>X: {d.x.toFixed(2)}</p>
                <p>Y: {d.y.toFixed(2)}</p>
                <p>Z: {d.z.toFixed(2)}</p>

                <p style={{ marginTop: 10 }}>
                  Status:{" "}
                  <span
                    style={{
                      color: isShake ? "#d97706" : "#16a34a",
                      fontWeight: "bold",
                    }}
                  >
                    {isShake ? "⚡ Bergerak" : "🟢 Stabil"}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================= STYLE ================= */

const wrapper = {
  display: "flex",
  justifyContent: "center",
  padding: 20,
};

const card = {
  width: "100%",
  maxWidth: 1000,
};

const subtitle = {
  color: "#64748b",
  marginBottom: 20,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 15,
};

const deviceCard = {
  padding: 15,
  borderRadius: 12,
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};
