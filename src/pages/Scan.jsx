import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { BASE_URL } from "../api/api";

function getDeviceId() {
  let id = localStorage.getItem("device_id");

  if (!id) {
    id = "dev-" + crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }

  return id;
}

export default function Scan() {
  const scannerRef = useRef(null);
  const scannedRef = useRef(false);

  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("idle");

  // idle | processing | success | error

  useEffect(() => {
    if (!userId) return;

    scannedRef.current = false;

    const reader = document.getElementById("reader");
    if (reader) reader.innerHTML = "";

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250,
        facingMode: "environment",
        showTorchButtonIfSupported: false,
        showZoomSliderIfSupported: false,
        rememberLastUsedCamera: false,
        supportedScanTypes: [0],
      },
      false,
    );

    scannerRef.current = scanner;

    scanner.render(
      async (text) => {
        if (scannedRef.current) return;

        scannedRef.current = true;

        setStatus("processing");

        try {
          await scannerRef.current.clear().catch(() => {});

          const res = await fetch(`${BASE_URL}?path=presence/checkin`, {
            method: "POST",
            body: JSON.stringify({
              user_id: userId,
              device_id: getDeviceId(),
              qr_token: text,
              ts: new Date().toISOString(),
            }),
          });

          const data = await res.json();

          if (data.ok) {
            setStatus("success");
          } else {
            setStatus("error");
          }
        } catch (e) {
          setStatus("error");
        }
      },
      () => {},
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [userId]);

  return (
    <div style={container}>
      <h2 style={title}>Scan Presensi</h2>

      {/* INPUT NIM */}

      {!userId && (
        <div style={card}>
          <h3>Masukkan NIM</h3>

          <input type="text" placeholder="Contoh: 22012345" value={userId} onChange={(e) => setUserId(e.target.value)} style={input} />

          <p style={{ fontSize: 14, color: "#666" }}>Masukkan NIM untuk melakukan presensi</p>
        </div>
      )}

      {/* QR SCANNER */}

      {status === "idle" && userId && <div id="reader" style={readerStyle} />}

      {/* PROCESSING */}

      {status === "processing" && (
        <div style={card}>
          <div className="loader"></div>
          <p>Memproses presensi...</p>
        </div>
      )}

      {/* SUCCESS */}

      {status === "success" && (
        <div style={{ ...card, background: "#e8f5e9" }}>
          <div style={checkmark}>✔</div>

          <h3 style={{ color: "green" }}>Presensi Berhasil</h3>
        </div>
      )}

      {/* ERROR */}

      {status === "error" && (
        <div style={{ ...card, background: "#ffebee" }}>
          <h3 style={{ color: "red" }}>Gagal Presensi</h3>

          <button onClick={() => window.location.reload()}>Coba Lagi</button>
        </div>
      )}

      {/* CSS HIDE BUTTON HTML5QRCODE */}

      <style>{`

        #reader__camera_selection { display: none !important; }
        #reader__dashboard_section_swaplink { display: none !important; }
        #reader__filescan_input { display: none !important; }
        span[style*="Scan an Image File"] { display: none !important; }

        .loader {
          border: 5px solid #eee;
          border-top: 5px solid #1976d2;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin: 0 auto 15px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

      `}</style>
    </div>
  );
}

const container = {
  padding: 20,
  paddingBottom: 80,
  textAlign: "center",
};

const title = {
  marginBottom: 20,
};

const readerStyle = {
  width: "100%",
  maxWidth: 350,
  margin: "0 auto",
};

const card = {
  padding: 30,
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  maxWidth: 350,
  margin: "0 auto",
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const checkmark = {
  fontSize: 50,
  marginBottom: 10,
};
