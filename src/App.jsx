import { useState } from "react";
import AdminQR from "./pages/AdminQR";
import Scan from "./pages/Scan";
import GPS from "./pages/GPS";
import Accel from "./pages/Accel";
import BottomNav from "./components/BottomNav";

export default function App() {
  const [page, setPage] = useState("qr");

  return (
    <div className="app-container">
      {page === "qr" && <AdminQR />}
      {page === "scan" && <Scan />}
      {page === "gps" && <GPS />}
      {page === "accel" && <Accel />}

      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}