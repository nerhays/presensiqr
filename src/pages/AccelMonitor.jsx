import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../api/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

// Warna per device (auto-assign)
const PALETTE = ["#6366f1", "#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6"];

function getDeviceColor(deviceId, colorMap) {
  if (!colorMap[deviceId]) {
    const idx = Object.keys(colorMap).length % PALETTE.length;
    colorMap[deviceId] = PALETTE[idx];
  }
  return colorMap[deviceId];
}

export default function AccelMonitor() {
  const [devices, setDevices] = useState({}); // { device_id: { color, latest, history[] } }
  const colorMapRef = useRef({});

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BASE_URL}?path=telemetry/accel/all`);
        const json = await res.json();

        if (!json.ok) return;

        setDevices((prev) => {
          const next = { ...prev };

          json.data.items.forEach((d) => {
            const color = getDeviceColor(d.device_id, colorMapRef.current);
            const magnitude = Math.sqrt(d.x ** 2 + d.y ** 2 + d.z ** 2);

            const point = {
              t: Date.now(),
              x: d.x,
              y: d.y,
              z: d.z,
            };

            const existing = next[d.device_id] || { history: [] };
            const history = [...existing.history, point];
            if (history.length > 40) history.shift();

            next[d.device_id] = {
              color,
              latest: d,
              magnitude,
              isShake: magnitude > 20,
              history,
            };
          });

          return next;
        });
      } catch (err) {
        console.error("fetch error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const deviceList = Object.entries(devices);

  return (
    <div style={wrapper}>
      <div style={container}>
        <h2 style={heading}>📊 Monitoring Accelerometer</h2>
        <p style={subtitle}>Data realtime pergerakan perangkat — update setiap 1 detik</p>

        {deviceList.length === 0 && <p style={{ color: "#94a3b8", marginTop: 30 }}>Menunggu data dari perangkat...</p>}

        {/* ===== TABEL RINGKASAN ===== */}
        {deviceList.length > 0 && (
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  {["Device", "X", "Y", "Z", "Magnitude", "Status"].map((h) => (
                    <th key={h} style={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deviceList.map(([id, d]) => (
                  <tr key={id} style={{ background: d.isShake ? "#fffbeb" : "white" }}>
                    <td style={td}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: d.color,
                          marginRight: 8,
                        }}
                      />
                      <span style={{ fontFamily: "monospace", fontSize: 12 }}>{id.slice(0, 20)}...</span>
                    </td>
                    <td style={td}>{d.latest.x.toFixed(2)}</td>
                    <td style={td}>{d.latest.y.toFixed(2)}</td>
                    <td style={td}>{d.latest.z.toFixed(2)}</td>
                    <td style={td}>{d.magnitude.toFixed(2)}</td>
                    <td style={td}>
                      <span
                        style={{
                          color: d.isShake ? "#d97706" : "#16a34a",
                          fontWeight: "bold",
                        }}
                      >
                        {d.isShake ? "⚡ Bergerak" : "🟢 Stabil"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== GRAFIK PER AXIS (semua device dalam 1 chart) ===== */}
        {deviceList.length > 0 && (
          <>
            {["x", "y", "z"].map((axis) => (
              <div key={axis} style={chartBox}>
                <h4 style={chartTitle}>Axis {axis.toUpperCase()}</h4>

                {/* Gabungkan history semua device jadi satu dataset per timestamp */}
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" tick={false} />
                    <YAxis domain={[-25, 25]} />
                    <Legend formatter={(value) => <span style={{ fontSize: 11, fontFamily: "monospace" }}>{value.slice(0, 16)}...</span>} />
                    {deviceList.map(([id, d]) => (
                      <Line key={id} data={d.history} type="monotone" dataKey={axis} stroke={d.color} strokeWidth={2} dot={false} isAnimationActive={false} name={id} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* =============== STYLES =============== */

const wrapper = {
  display: "flex",
  justifyContent: "center",
  padding: "24px 16px",
};

const container = {
  width: "100%",
  maxWidth: 1000,
};

const heading = {
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 4,
};

const subtitle = {
  color: "#64748b",
  marginBottom: 24,
  fontSize: 14,
};

const tableWrap = {
  overflowX: "auto",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  marginBottom: 30,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const th = {
  padding: "10px 14px",
  textAlign: "left",
  background: "#f8fafc",
  borderBottom: "1px solid #e5e7eb",
  color: "#475569",
  fontWeight: 600,
  fontSize: 13,
};

const td = {
  padding: "10px 14px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "middle",
};

const chartBox = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "16px 20px",
  marginBottom: 20,
};

const chartTitle = {
  margin: "0 0 12px 0",
  fontSize: 15,
  color: "#374151",
};
