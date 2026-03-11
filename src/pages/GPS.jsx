import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useState, useEffect } from "react";
import { BASE_URL } from "../api/api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* ===============================
   ICON MARKER
================================ */

// marker mahasiswa
const mhsIcon = L.divIcon({
  className: "gps-marker",
  html: `
    <div class="gps-pulse-blue"></div>
    <div class="gps-dot-blue"></div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// marker dosen
const dosenIcon = L.divIcon({
  className: "gps-marker",
  html: `
    <div class="gps-pulse-red"></div>
    <div class="gps-dot-red"></div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
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

        {role === "mhs" && (
          <p style={{ marginBottom: 25, color: "#6b7280" }}>
            Kirim lokasi perangkat
          </p>
        )}

        {role === "dosen" && (
          <p style={{ marginBottom: 25, color: "#6b7280" }}>
            Monitoring lokasi mahasiswa
          </p>
        )}

        {role === "mhs" && (
          <button onClick={sendGPS} style={{ marginBottom: 20 }}>
            {status === "loading" ? "Mengirim..." : "📍 Kirim Lokasi"}
          </button>
        )}

        {status === "success" && (
          <div style={successBox}>✅ Lokasi berhasil dikirim</div>
        )}

        {status === "error" && (
          <div style={errorBox}>❌ Gagal mengirim lokasi</div>
        )}

        <div style={mapContainer}>
          <MapContainer center={pos} zoom={15} style={{ height: "100%" }}>
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* marker mahasiswa */}
            {role === "mhs" && <Marker position={pos} icon={mhsIcon} />}

            {/* marker mahasiswa dilihat dosen */}
            {role === "dosen" &&
              markers.map((m, i) => (
                <Marker key={i} position={[m.lat, m.lng]} icon={dosenIcon} />
              ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   STYLE MARKER
================================ */

const style = document.createElement("style");
style.innerHTML = `

.gps-marker {
  position: relative;
}

/* MAHASISWA */

.gps-dot-blue {
  width: 14px;
  height: 14px;
  background: #2563eb;
  border-radius: 50%;
  border: 3px solid white;
  position: absolute;
  left: 8px;
  top: 8px;
  z-index: 2;
}

.gps-pulse-blue {
  width: 30px;
  height: 30px;
  background: rgba(37,99,235,0.4);
  border-radius: 50%;
  position: absolute;
  animation: pulse 1.8s infinite;
}

/* DOSEN */

.gps-dot-red {
  width: 14px;
  height: 14px;
  background: #ef4444;
  border-radius: 50%;
  border: 3px solid white;
  position: absolute;
  left: 8px;
  top: 8px;
  z-index: 2;
}

.gps-pulse-red {
  width: 30px;
  height: 30px;
  background: rgba(239,68,68,0.4);
  border-radius: 50%;
  position: absolute;
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.6);
    opacity: 0.8;
  }
  70% {
    transform: scale(1.6);
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

`;
document.head.appendChild(style);

/* ===============================
   STYLE LAYOUT
================================ */

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