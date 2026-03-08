import { QrCode, ScanLine, MapPin, Activity } from "lucide-react";

export default function BottomNav({ role, page, setPage }) {
  return (
    <div style={navWrapper}>
      <div style={navBar}>
        {/* DOSEN */}
        {role === "dosen" && (
          <>
            <NavItem icon={<QrCode size={20} />} label="QR" active={page === "qr"} onClick={() => setPage("qr")} />

            <NavItem icon={<MapPin size={20} />} label="GPS" active={page === "gps"} onClick={() => setPage("gps")} />

            <NavItem icon={<Activity size={20} />} label="Accel" active={page === "accel"} onClick={() => setPage("accel")} />
          </>
        )}

        {/* MAHASISWA */}
        {role === "mhs" && (
          <>
            <NavItem icon={<ScanLine size={20} />} label="Scan" active={page === "scan"} onClick={() => setPage("scan")} />

            <NavItem icon={<MapPin size={20} />} label="GPS" active={page === "gps"} onClick={() => setPage("gps")} />

            <NavItem icon={<Activity size={20} />} label="Accel" active={page === "accel"} onClick={() => setPage("accel")} />
          </>
        )}
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        cursor: "pointer",
        color: active ? "#6366f1" : "#64748b",
        fontWeight: active ? 600 : 400,
        transition: "0.2s",
      }}
    >
      {icon}
      <span style={{ fontSize: 12 }}>{label}</span>
    </div>
  );
}

const navWrapper = {
  position: "fixed",
  bottom: 20,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
};

const navBar = {
  display: "flex",
  gap: 40,
  background: "white",
  padding: "12px 28px",
  borderRadius: 40,
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
};
