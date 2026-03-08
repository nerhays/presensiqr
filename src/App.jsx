import { useState } from "react";
import AdminQR from "./pages/AdminQR";
import Scan from "./pages/Scan";
import GPS from "./pages/GPS";
import Accel from "./pages/Accel";
import BottomNav from "./components/BottomNav";

export default function App() {
  const [role, setRole] = useState("");
  const [page, setPage] = useState("");

  // pilih role dulu
  if (!role) {
    return (
      <div style={roleContainer}>
        <h2>Pilih Mode</h2>

        <button
          style={btn}
          onClick={() => {
            setRole("mhs");
            setPage("scan");
          }}
        >
          Mahasiswa
        </button>

        <button
          style={btn}
          onClick={() => {
            setRole("dosen");
            setPage("qr");
          }}
        >
          Dosen
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* DOSEN */}
      {role === "dosen" && page === "qr" && <AdminQR />}
      {role === "dosen" && page === "gps" && <GPS role={role} />}
      {role === "dosen" && page === "accel" && <Accel />}

      {/* MAHASISWA */}
      {role === "mhs" && page === "scan" && <Scan />}
      {role === "mhs" && page === "gps" && <GPS role={role} />}
      {role === "mhs" && page === "accel" && <Accel />}

      <BottomNav role={role} page={page} setPage={setPage} />
    </div>
  );
}

const roleContainer = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  gap: 20,
};

const btn = {
  padding: "12px 25px",
  fontSize: 16,
  border: "none",
  background: "#1976d2",
  color: "#fff",
  borderRadius: 6,
  cursor: "pointer",
};
