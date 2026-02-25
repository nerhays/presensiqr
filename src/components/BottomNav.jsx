import { Link } from "react-router-dom";

export default function BottomNav() {
  return (
    <div style={navStyle}>
      <Link to="/">QR</Link>
      <Link to="/scan">Scan</Link>
      <Link to="/gps">GPS</Link>
      <Link to="/accel">Accel</Link>
    </div>
  );
}

const navStyle = {
  position: "fixed",
  bottom: 0,
  width: "100%",
  display: "flex",
  justifyContent: "space-around",
  padding: "12px",
  background: "#111",
  color: "white",
};
