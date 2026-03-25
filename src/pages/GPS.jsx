import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import { BASE_URL } from "../api/api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* ===============================
   STYLES INJECTED
================================ */

const style = document.createElement("style");
style.innerHTML = `
.gps-marker { position: relative; }

.gps-dot-blue {
  width: 14px; height: 14px;
  background: #2563eb;
  border-radius: 50%;
  border: 3px solid white;
  position: absolute; left: 8px; top: 8px; z-index: 2;
}
.gps-pulse-blue {
  width: 30px; height: 30px;
  background: rgba(37,99,235,0.4);
  border-radius: 50%; position: absolute;
  animation: pulse 1.8s infinite;
}
.gps-dot-red {
  width: 14px; height: 14px;
  background: #ef4444;
  border-radius: 50%;
  border: 3px solid white;
  position: absolute; left: 8px; top: 8px; z-index: 2;
}
.gps-pulse-red {
  width: 30px; height: 30px;
  background: rgba(239,68,68,0.4);
  border-radius: 50%; position: absolute;
  animation: pulse 1.8s infinite;
}
@keyframes pulse {
  0%   { transform: scale(0.6); opacity: 0.8; }
  70%  { transform: scale(1.6); opacity: 0; }
  100% { opacity: 0; }
}

/* Popup custom */
.leaflet-popup-content-wrapper {
  border-radius: 10px !important;
  font-size: 13px;
  min-width: 180px;
}
.popup-device {
  font-family: monospace;
  font-size: 11px;
  color: #475569;
  word-break: break-all;
  margin-top: 4px;
}
.popup-ts {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}
.popup-acc {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}
`;
if (!document.getElementById("gps-style")) {
  style.id = "gps-style";
  document.head.appendChild(style);
}

/* ===============================
   ICONS
================================ */

const mhsIcon = L.divIcon({
  className: "gps-marker",
  html: `<div class="gps-pulse-blue"></div><div class="gps-dot-blue"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const dosenIcon = L.divIcon({
  className: "gps-marker",
  html: `<div class="gps-pulse-red"></div><div class="gps-dot-red"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

/* ===============================
   MAP AUTO-CENTER (untuk mhs)
================================ */

function MapCenter({ pos }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.setView(pos, map.getZoom());
  }, [pos]);
  return null;
}

/* ===============================
   MAIN COMPONENT
================================ */

export default function GPS({ role }) {
  const [pos, setPos] = useState([-7.2575, 112.7521]);
  const [status, setStatus] = useState("idle"); // idle | tracking | error
  const [lastSent, setLastSent] = useState(null);

  const deviceId = localStorage.getItem("device_id") || "dev-demo";

  const watchRef = useRef(null); // geolocation watchId
  const intervalRef = useRef(null); // interval kirim per menit

  // ===============================
  // KIRIM GPS (1x)
  // ===============================

  const sendPosition = async (lat, lng, accuracy) => {
    try {
      const res = await fetch(`${BASE_URL}?path=telemetry/gps`, {
        method: "POST",
        body: JSON.stringify({
          device_id: deviceId,
          ts: new Date().toISOString(),
          lat,
          lng,
          accuracy_m: accuracy,
        }),
      });
      const data = await res.json();
      if (data.ok) setLastSent(new Date().toLocaleTimeString());
    } catch {
      setStatus("error");
    }
  };

  // ===============================
  // START TRACKING
  // ===============================

  const startTracking = () => {
    if (status === "tracking") return;
    setStatus("tracking");

    // watch posisi (auto-update saat pindah)
    watchRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const { latitude: lat, longitude: lng, accuracy } = p.coords;
        setPos([lat, lng]);
        sendPosition(lat, lng, accuracy);
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, maximumAge: 10000 },
    );

    // fallback: kirim setiap 60 detik meski tidak pindah
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition((p) => {
        const { latitude: lat, longitude: lng, accuracy } = p.coords;
        setPos([lat, lng]);
        sendPosition(lat, lng, accuracy);
      });
    }, 60 * 1000);
  };

  // ===============================
  // STOP TRACKING
  // ===============================

  const stopTracking = () => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatus("idle");
  };

  // cleanup saat unmount
  useEffect(() => () => stopTracking(), []);

  // ===============================
  // MONITORING DOSEN
  // ===============================

  const [markers, setMarkers] = useState([]);

  const loadAllGPS = async () => {
    try {
      const res = await fetch(`${BASE_URL}?path=telemetry/gps/all`);
      const data = await res.json();
      if (data.ok) setMarkers(data.data.items);
    } catch {}
  };

  useEffect(() => {
    if (role !== "dosen") return;
    loadAllGPS();
    const interval = setInterval(loadAllGPS, 5000);
    return () => clearInterval(interval);
  }, [role]);

  // ===============================
  // UI
  // ===============================

  return (
    <div style={wrapper}>
      <div className="card" style={cardStyle}>
        <h2>GPS Tracking</h2>

        {/* ---- MAHASISWA ---- */}
        {role === "mhs" && (
          <>
            <p style={subtitleStyle}>Kirim lokasi perangkat secara realtime</p>

            <div style={buttonRow}>
              <button
                onClick={startTracking}
                disabled={status === "tracking"}
                style={{
                  background: status === "tracking" ? "#86efac" : "#22c55e",
                  opacity: status === "tracking" ? 0.8 : 1,
                }}
              >
                {status === "tracking" ? "📡 Tracking..." : "▶️ Mulai Kirim Lokasi"}
              </button>

              <button onClick={stopTracking} disabled={status !== "tracking"} style={{ background: "#ef4444" }}>
                ⏹ Stop
              </button>
            </div>

            {status === "tracking" && lastSent && (
              <div style={infoBox}>
                📡 Aktif · Terakhir dikirim: <strong>{lastSent}</strong>
              </div>
            )}

            {status === "error" && <div style={errorBox}>❌ Gagal mendapatkan lokasi. Pastikan GPS aktif.</div>}
          </>
        )}

        {/* ---- DOSEN ---- */}
        {role === "dosen" && (
          <>
            <p style={subtitleStyle}>Monitoring lokasi mahasiswa · {markers.length} perangkat aktif</p>

            {/* Tabel ringkasan */}
            {markers.length > 0 && (
              <div style={tableWrap}>
                <table style={table}>
                  <thead>
                    <tr>
                      {["Device ID", "Lat", "Lng", "Akurasi", "Terakhir Update"].map((h) => (
                        <th key={h} style={th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {markers.map((m) => (
                      <tr key={m.device_id}>
                        <td style={td}>
                          <span style={{ fontFamily: "monospace", fontSize: 11 }}>{m.device_id}</span>
                        </td>
                        <td style={td}>{Number(m.lat).toFixed(6)}</td>
                        <td style={td}>{Number(m.lng).toFixed(6)}</td>
                        <td style={td}>{m.accuracy_m ? `${Number(m.accuracy_m).toFixed(0)} m` : "-"}</td>
                        <td style={td}>{m.ts ? new Date(m.ts).toLocaleTimeString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ---- MAP ---- */}
        <div style={mapContainer}>
          <MapContainer center={pos} zoom={15} style={{ height: "100%", borderRadius: 16 }}>
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* auto-center untuk mhs */}
            {role === "mhs" && <MapCenter pos={pos} />}

            {/* marker mhs (posisi sendiri) */}
            {role === "mhs" && (
              <Marker position={pos} icon={mhsIcon}>
                <Popup>
                  <strong>📱 Perangkat Anda</strong>
                  <div className="popup-device">{deviceId}</div>
                  {lastSent && <div className="popup-ts">Update: {lastSent}</div>}
                </Popup>
              </Marker>
            )}

            {/* marker semua mhs (dosen view) */}
            {role === "dosen" &&
              markers.map((m) => (
                <Marker key={m.device_id} position={[m.lat, m.lng]} icon={dosenIcon}>
                  <Popup>
                    <strong>📱 Mahasiswa</strong>
                    <div className="popup-device">{m.device_id}</div>
                    {m.accuracy_m && <div className="popup-acc">Akurasi: ±{Number(m.accuracy_m).toFixed(0)} m</div>}
                    {m.ts && <div className="popup-ts">{new Date(m.ts).toLocaleTimeString()}</div>}
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   STYLES
================================ */

const wrapper = { display: "flex", justifyContent: "center", minHeight: "70vh" };
const cardStyle = { width: "100%", maxWidth: 1000 };
const subtitleStyle = { color: "#6b7280", marginBottom: 20 };
const buttonRow = { display: "flex", gap: 10, marginBottom: 16 };

const infoBox = {
  background: "#dcfce7",
  padding: "10px 14px",
  borderRadius: 10,
  marginBottom: 15,
  fontSize: 14,
};
const errorBox = {
  background: "#fee2e2",
  padding: "10px 14px",
  borderRadius: 10,
  marginBottom: 15,
  fontSize: 14,
};

const mapContainer = {
  height: 450,
  borderRadius: 20,
  overflow: "hidden",
  marginTop: 20,
};

const tableWrap = {
  overflowX: "auto",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  marginBottom: 20,
};
const table = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const th = {
  padding: "9px 12px",
  textAlign: "left",
  background: "#f8fafc",
  borderBottom: "1px solid #e5e7eb",
  color: "#475569",
  fontWeight: 600,
  fontSize: 12,
};
const td = {
  padding: "9px 12px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "middle",
};
