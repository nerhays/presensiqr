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
    const res = await fetch(
      `${BASE_URL}?path=presence/list&course_id=${courseId}&session_id=${sessionId}`
    );

    const data = await res.json();

    if (data.ok) {
      setPresenceList(data.data.items);
    }
  };

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
        <h2 style={title}>Generate QR Presensi</h2>

        {!started && (
          <div style={formArea}>
            <div style={field}>
              <label>Course</label>

              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                style={select}
              >
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

              <select
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                style={select}
              >
                <option value="">Pilih Sesi</option>

                {sessions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <button
              style={btn}
              onClick={() => setStarted(true)}
              disabled={!courseId || !sessionId}
            >
              Generate QR
            </button>
          </div>
        )}

        {token && (
          <>
            <div style={qrBox}>
              <QRCode value={token} size={200} />

              <p style={countdownText}>
                refresh dalam <b>{countdown}</b> detik
              </p>
            </div>

            <div style={presenceHeader}>
              <h3>Sudah Absen</h3>
              <span>{presenceList.length}</span>
            </div>

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
                    <td>✓</td>
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
    return { background: "#ecfdf5" };
  }

  return {};
}

/* ---------- STYLE ---------- */

const wrapper = {
  display: "flex",
  justifyContent: "center",
  paddingTop: 60,
};

const card = {
  width: 750,
  background: "#ffffff",
  borderRadius: 18,
  padding: 40,
  boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
};

const title = {
  marginBottom: 30,
};

const formArea = {
  display: "flex",
  gap: 20,
  alignItems: "end",
  marginBottom: 20,
};

const field = {
  display: "flex",
  flexDirection: "column",
};

const select = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  minWidth: 200,
};

const btn = {
  padding: "10px 20px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  borderRadius: 8,
  cursor: "pointer",
};

const qrBox = {
  textAlign: "center",
  marginTop: 20,
};

const countdownText = {
  marginTop: 10,
  color: "#64748b",
};

const presenceHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 30,
};

const table = {
  width: "100%",
  marginTop: 15,
  borderCollapse: "collapse",
};