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
    <div style={page}>
      <h2>Generate QR</h2>
      <button onClick={generate}>Generate</button>

      {token && (
        <>
          <p>{token}</p>
          <QRCode value={token} size={220} />
        </>
      )}
    </div>
  );
}

const page = { padding: 20, paddingBottom: 70 };
