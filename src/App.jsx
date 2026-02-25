import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";

import AdminQR from "./pages/AdminQR";
import Scan from "./pages/Scan";
import GPS from "./pages/GPS";
import Accel from "./pages/Accel";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminQR />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/gps" element={<GPS />} />
        <Route path="/accel" element={<Accel />} />
      </Routes>

      <BottomNav />
    </BrowserRouter>
  );
}
