import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { BASE_URL } from "../api/api";

export default function Scan() {
  const scannerRef = useRef(null);
  const scannedRef = useRef(false);

  useEffect(() => {
    scannedRef.current = false;

    const reader = document.getElementById("reader");
    if (reader) reader.innerHTML = "";

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250,
        // Paksa kamera belakang, nonaktifkan fitur tambahan
        facingMode: "environment",
        showTorchButtonIfSupported: false,
        showZoomSliderIfSupported: false,
        defaultZoomValueIfSupported: 1,
        // Sembunyikan tombol select camera & scan image file
        rememberLastUsedCamera: false,
        supportedScanTypes: [0], // 0 = SCAN_TYPE_CAMERA saja
      },
      false, // verbose = false
    );

    scannerRef.current = scanner;

    scanner.render(
      async (text) => {
        if (scannedRef.current) return;
        scannedRef.current = true;

        try {
          // Stop dulu sebelum fetch
          await scannerRef.current.clear().catch(() => {});

          await fetch(`${BASE_URL}?path=presence/checkin`, {
            method: "POST",
            body: JSON.stringify({
              user_id: "20230001",
              device_id: "dev-001",
              course_id: "cloud-101",
              session_id: "sesi-01",
              qr_token: text,
              ts: new Date().toISOString(),
            }),
          });

          alert("Check-in sukses!");
        } catch (e) {
          alert("Gagal check-in: " + e.message);
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
  }, []);

  return (
    <div style={{ padding: 20, paddingBottom: 70 }}>
      <h2>Scan Presensi</h2>

      {/* Sembunyikan tombol switch kamera & scan file via CSS */}
      <style>{`
        #reader__camera_selection { display: none !important; }
        #reader__dashboard_section_swaplink { display: none !important; }
        select#reader__camera_selection { display: none !important; }
        #reader__filescan_input { display: none !important; }
        span[style*="Scan an Image File"] { display: none !important; }
        #reader__scan_region img { display: none !important; }
      `}</style>

      <div id="reader" />
    </div>
  );
}
