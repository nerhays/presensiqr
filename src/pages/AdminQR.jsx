import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { BASE_URL } from "../api/api";

export default function AdminQR() {

  const [token,setToken] = useState("");
  const [started,setStarted] = useState(false);

  const [courseId,setCourseId] = useState("");
  const [sessionId,setSessionId] = useState("");

  const [presenceList,setPresenceList] = useState([]);

  const [countdown,setCountdown] = useState(30);

  const courses = [
    {label:"Cloud Computing Praktikum",value:"cloud-prak"},
    {label:"Cloud Computing Teori",value:"cloud-teo"},
    {label:"ERP",value:"erp"}
  ];

  const sessions = ["sesi-1","sesi-2","sesi-3","sesi-4"];

  /* =======================
     GENERATE QR
  ======================= */

  const generate = async () => {

    const res = await fetch(`${BASE_URL}?path=presence/qr/generate`,{
      method:"POST",
      body:JSON.stringify({
        course_id:courseId,
        session_id:sessionId,
        ts:new Date().toISOString()
      })
    });

    const data = await res.json();

    if(data.ok){
      setToken(data.data.qr_token);
      setCountdown(30);
    }

  };

  /* =======================
     LOAD PRESENCE
  ======================= */

  const loadPresence = async () => {

    const res = await fetch(
      `${BASE_URL}?path=presence/list&course_id=${courseId}&session_id=${sessionId}`
    );

    const data = await res.json();

    if(data.ok){
      setPresenceList(data.data.items);
    }

  };

  /* =======================
     QR REFRESH TIMER
  ======================= */

  useEffect(()=>{

    if(!started) return;

    const timer = setInterval(()=>{

      setCountdown(c=>{

        if(c<=1){
          generate();
          return 30;
        }

        return c-1;

      });

    },1000);

    return ()=>clearInterval(timer);

  },[started]);

  /* =======================
     PRESENCE LIVE
  ======================= */

  useEffect(()=>{

    if(!started) return;

    generate();
    loadPresence();

    const interval = setInterval(loadPresence,1000);

    return ()=>clearInterval(interval);

  },[started]);

  /* =======================
     UI
  ======================= */

  return(

    <div className="dashboard">

      {/* QR CARD */}

      <div className="card qr-box">

        <h2>QR Presensi</h2>

        {!started && (

          <div style={{marginTop:20}}>

            <div style={{marginBottom:15}}>

              <label>Course</label>

              <select
                value={courseId}
                onChange={e=>setCourseId(e.target.value)}
              >

                <option value="">Pilih Course</option>

                {courses.map(c=>(
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}

              </select>

            </div>

            <div style={{marginBottom:15}}>

              <label>Sesi</label>

              <select
                value={sessionId}
                onChange={e=>setSessionId(e.target.value)}
              >

                <option value="">Pilih Sesi</option>

                {sessions.map(s=>(
                  <option key={s} value={s}>{s}</option>
                ))}

              </select>

            </div>

            <button
              onClick={()=>setStarted(true)}
              disabled={!courseId || !sessionId}
            >
              Generate QR
            </button>

          </div>

        )}

        {token && (

          <>

            <div style={{marginTop:25}}>

              <QRCode value={token} size={200}/>

            </div>

            <p style={{marginTop:10,color:"#64748b"}}>
              refresh dalam <b>{countdown}</b> detik
            </p>

          </>

        )}

      </div>

      {/* PRESENCE LIST */}

      <div className="card">

        <div style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center"
        }}>

          <h2>Mahasiswa Hadir</h2>

          <span style={{
            background:"#e0f2fe",
            padding:"5px 12px",
            borderRadius:20
          }}>
            {presenceList.length}
          </span>

        </div>

        <table>

          <thead>
            <tr>
              <th>No</th>
              <th>User</th>
              <th>Waktu</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {presenceList.map((p,i)=>(

              <tr key={i} style={rowHighlight(p.ts)}>

                <td>{i+1}</td>

                <td>{p.user_id}</td>

                <td>
                  {new Date(p.ts).toLocaleTimeString()}
                </td>

                <td>✓</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

/* =======================
   HIGHLIGHT ROW
======================= */

function rowHighlight(ts){

  const now = Date.now();
  const t = new Date(ts).getTime();

  if(now - t < 5000){

    return {
      background:"#dcfce7",
      transition:"0.5s"
    };

  }

  return {};

}