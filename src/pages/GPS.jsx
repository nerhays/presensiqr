import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useState } from "react";
import { BASE_URL } from "../api/api";
import "leaflet/dist/leaflet.css";

export default function GPS() {
  const [pos, setPos] = useState([-7.2575, 112.7521]);

  const sendGPS = () => {
    navigator.geolocation.getCurrentPosition(async (p) => {
      const lat = p.coords.latitude;
      const lng = p.coords.longitude;

      setPos([lat, lng]);

      await fetch(`${BASE_URL}?path=telemetry/gps`, {
        method: "POST",
        body: JSON.stringify({
          device_id: "dev-001",
          ts: new Date().toISOString(),
          lat,
          lng,
          accuracy_m: p.coords.accuracy,
        }),
      });
    });
  };

  return (
    <div style={container}>
      <button style={btn} onClick={sendGPS}>
        Kirim Lokasi
      </button>

      <MapContainer center={pos} zoom={15} style={mapStyle}>
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={pos} />
      </MapContainer>
    </div>
  );
}
const container = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 60, // ruang untuk bottom nav
  display: "flex",
  flexDirection: "column",
};

const btn = {
  padding: 16,
  fontSize: 18,
  background: "#1976d2",
  color: "white",
  border: "none",
};

const mapStyle = {
  flex: 1,
  width: "100%",
};
