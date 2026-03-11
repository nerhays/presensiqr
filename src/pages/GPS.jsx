import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useState, useEffect } from "react";
import { BASE_URL } from "../api/api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = L.divIcon({
  className: "",
  html: `
  <div style="
    width:22px;
    height:22px;
    background:#2563eb;
    border-radius:50%;
    border:4px solid white;
    box-shadow:0 0 8px rgba(0,0,0,0.4);
  "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export default function GPS({ role }) {
  const [pos, setPos] = useState([-7.2575, 112.7521]);
  const [status, setStatus] = useState("idle");

  const deviceId = localStorage.getItem("device_id") || "dev-demo";

  // ===============================
  // MAHASISWA : KIRIM GPS
  // ===============================

  const sendGPS = () => {
    setStatus("loading");

    navigator.geolocation.getCurrentPosition(async (p) => {
      const lat = p.coords.latitude;
      const lng = p.coords.longitude;

      setPos([lat, lng]);

      try {
        const res = await fetch(`${BASE_URL}?path=telemetry/gps`, {
          method: "POST",
          body: JSON.stringify({
            device_id: deviceId,
            ts: new Date().toISOString(),
            lat,
            lng,
            accuracy_m: p.coords.accuracy,
          }),
        });

        const data = await res.json();

        if (data.ok) {
          setStatus("success");
          setTimeout(() => setStatus("idle"), 3000);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    });
  };

  // ===============================
  // DOSEN : LIHAT GPS MAHASISWA
  // ===============================

  const loadLatestGPS = async () => {
    try {
      const res = await fetch(`${BASE_URL}?path=telemetry/gps/latest&device_id=${deviceId}`);

      const data = await res.json();

      if (data.ok) {
        setPos([data.data.lat, data.data.lng]);
      }
    } catch {}
  };

  const [markers, setMarkers] = useState([]);

  const loadAllGPS = async () => {
    try {
      const res = await fetch(`${BASE_URL}?path=telemetry/gps/all`);

      const data = await res.json();

      if (data.ok) {
        setMarkers(data.data.items);
      }
    } catch {}
  };

  useEffect(() => {
    if (role !== "dosen") return;

    loadAllGPS();

    const interval = setInterval(() => {
      loadAllGPS();
    }, 5000);

    return () => clearInterval(interval);
  }, [role]);

  // ===============================
  // UI
  // ===============================

  return (
    <div style={wrapper}>
      <div className="card" style={cardStyle}>
        <h2>GPS Tracking</h2>

        {role === "mhs" && <p style={{ marginBottom: 25, color: "#6b7280" }}>Kirim lokasi perangkat</p>}

        {role === "dosen" && <p style={{ marginBottom: 25, color: "#6b7280" }}>Monitoring lokasi mahasiswa</p>}

        {role === "mhs" && (
          <button onClick={sendGPS} style={{ marginBottom: 20 }}>
            {status === "loading" ? "Mengirim..." : "📍 Kirim Lokasi"}
          </button>
        )}

        {status === "success" && <div style={successBox}>✅ Lokasi berhasil dikirim</div>}

        {status === "error" && <div style={errorBox}>❌ Gagal mengirim lokasi</div>}

        <div style={mapContainer}>
          <MapContainer center={pos} zoom={15} style={{ height: "100%" }}>
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* marker mahasiswa */}
            {role === "mhs" && <Marker position={pos} icon={customIcon} />}

            {/* marker semua mahasiswa untuk dosen */}
            {role === "dosen" &&
              markers.map((m, i) => (
                <Marker key={i} position={[m.lat, m.lng]} icon={customIcon} />
              ))}
          </MapContainer>
        </div>
      </div>
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
  maxWidth: 1000,
};

const mapContainer = {
  height: 450,
  borderRadius: 20,
  overflow: "hidden",
  marginTop: 20,
};

const successBox = {
  background: "#dcfce7",
  padding: 12,
  borderRadius: 10,
  marginBottom: 15,
};

const errorBox = {
  background: "#fee2e2",
  padding: 12,
  borderRadius: 10,
  marginBottom: 15,
};