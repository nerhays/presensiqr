import { useState } from "react";
import QRCode from "react-qr-code";
import { BASE_URL } from "../api/api";

export default function AdminQR() {
  const [token, setToken] = useState("");

  const generate = async () => {
    const res = await fetch(`${BASE_URL}?path=presence/qr/generate`, {
      method: "POST",
      body: JSON.stringify({
        course_id: "cloud-101",
        session_id: "sesi-01",
        ts: new Date().toISOString(),
      }),
    });

    const data = await res.json();
    setToken(data.data.qr_token);
  };

  return (
    <div style={wrapper}>
      <div className="card" style={cardStyle}>
        <h2 style={{ marginBottom: 10 }}>Generate QR</h2>

        <p style={{ marginBottom: 25, color: "#6b7280" }}>
          Buat kode QR untuk presensi sesi ini
        </p>

        <button onClick={generate} style={{ marginBottom: 30 }}>
          Generate QR
        </button>

        {token && (
          <>
            <p style={{ marginBottom: 15, fontWeight: 600 }}>
              {token}
            </p>

            <QRCode value={token} size={220} />
          </>
        )}
      </div>
    </div>
  );
}

const wrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "70vh",
};

const cardStyle = {
  maxWidth: 600,
  width: "100%",
  textAlign: "center",
};