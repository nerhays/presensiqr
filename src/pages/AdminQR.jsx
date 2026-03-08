import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { BASE_URL } from "../api/api";

export default function AdminQR() {
  const [token, setToken] = useState("");
  const [started, setStarted] = useState(false);

  const [courseId, setCourseId] = useState("");
  const [sessionId, setSessionId] = useState("");

  const [presenceList, setPresenceList] = useState([]);

  const [countdown, setCountdown] = useState(30);

  const courses = [
    { label: "Cloud Computing Praktikum", value: "cloud-prak" },
    { label: "Cloud Computing Teori", value: "cloud-teo" },
    { label: "ERP", value: "erp" },
  ];

  const sessions = ["sesi-1", "sesi-2", "sesi-3", "sesi-4"];

  const generate = async () => {
    const res = await fetch(`${BASE_URL}?path=presence/qr/generate`, {
      method: "POST",
      body: JSON.stringify({
        course_id: courseId,
        session_id: sessionId,
        ts: new Date().toISOString(),
      }),
    });

    const data = await res.json();

    if (data.ok) {
      setToken(data.data.qr_token);
      setCountdown(30);
    }
  };

  const loadPresence = async () => {
    const res = await fetch(`${BASE_URL}?path=presence/list&course_id=${courseId}&session_id=${sessionId}`);

    const data = await res.json();

    if (data.ok) {
      setPresenceList(data.data.items);
    }
  };

  // countdown timer
  useEffect(() => {
    if (!started) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          generate();
          return 30;
        }

        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started]);

  // refresh presence realtime
  useEffect(() => {
    if (!started) return;

    generate();
    loadPresence();

    const interval = setInterval(() => {
      loadPresence();
    }, 3000);

    return () => clearInterval(interval);
  }, [started]);

  return (
    <div style={wrapper}>
      <div style={card}>
        <h2>Generate QR Presensi</h2>

        {!started && (
          <div style={{ marginBottom: 20 }}>
            <div style={field}>
              <label>Course</label>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">Pilih Course</option>
                {courses.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={field}>
              <label>Sesi</label>
              <select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                <option value="">Pilih Sesi</option>
                {sessions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <button style={btn} onClick={() => setStarted(true)} disabled={!courseId || !sessionId}>
              Generate QR
            </button>
          </div>
        )}

        {token && (
          <>
            <div style={qrBox}>
              <QRCode value={token} size={220} />

              <p style={{ marginTop: 10 }}>
                QR refresh dalam <b>{countdown}</b> detik
              </p>
            </div>

            <h3 style={{ marginTop: 30 }}>Sudah Absen ({presenceList.length})</h3>

            <table style={table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>User</th>
                  <th>Waktu</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {presenceList.map((p, i) => (
                  <tr key={i} style={rowHighlight(p.ts)}>
                    <td>{i + 1}</td>
                    <td>{p.user_id}</td>
                    <td>{new Date(p.ts).toLocaleTimeString()}</td>
                    <td>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

function rowHighlight(ts) {
  const now = Date.now();
  const t = new Date(ts).getTime();

  if (now - t < 5000) {
    return { background: "#d1fae5" };
  }

  return {};
}

const wrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "80vh",
};

const card = {
  width: 700,
  background: "#fff",
  padding: 30,
  borderRadius: 10,
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
};

const qrBox = {
  textAlign: "center",
};

const field = {
  marginBottom: 15,
};

const btn = {
  padding: "10px 20px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  borderRadius: 6,
  cursor: "pointer",
};

const table = {
  width: "100%",
  marginTop: 15,
  borderCollapse: "collapse",
};
