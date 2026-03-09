import { useState } from "react";

import AdminQR from "./pages/AdminQR";
import Scan from "./pages/Scan";
import GPS from "./pages/GPS";
import Accel from "./pages/Accel";

import BottomNav from "./components/BottomNav";

export default function App() {

  const [role,setRole] = useState("");
  const [page,setPage] = useState("");

  /* ==========================
     ROLE SCREEN
  ========================== */

  if(!role){
    return(

      <div className="app-container">

        <div className="card" style={roleCard}>

          <h2>Pilih Role</h2>

          <p style={{color:"#64748b",marginBottom:20}}>
            Silakan pilih apakah anda sebagai dosen atau mahasiswa
          </p>

          <div style={roleButtons}>

            <button
              onClick={()=>{
                setRole("mhs");
                setPage("scan");
              }}
            >
              Mahasiswa
            </button>

            <button
              onClick={()=>{
                setRole("dosen");
                setPage("qr");
              }}
            >
              Dosen
            </button>

          </div>

        </div>

      </div>

    );
  }

  /* ==========================
     MAIN APP
  ========================== */

  return(

    <div className="app-container">

      {/* DOSEN */}

      {role==="dosen" && page==="qr" && <AdminQR/>}
      {role==="dosen" && page==="gps" && <GPS role={role}/>}
      {role==="dosen" && page==="accel" && <Accel/>}

      {/* MAHASISWA */}

      {role==="mhs" && page==="scan" && <Scan/>}
      {role==="mhs" && page==="gps" && <GPS role={role}/>}
      {role==="mhs" && page==="accel" && <Accel/>}

      <BottomNav
        role={role}
        page={page}
        setPage={setPage}
      />

    </div>

  );

}

/* ==========================
   STYLE
========================== */

const roleCard = {
  maxWidth:420,
  margin:"100px auto",
  textAlign:"center"
};

const roleButtons = {
  display:"flex",
  justifyContent:"center",
  gap:15
};