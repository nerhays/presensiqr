// ===================== ENTRY =====================

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

// ===================== ROUTER =====================

function handleRequest(e) {
  const path = e.parameter.path || "";

  // ===== PRESENCE =====
  if (path === "presence/qr/generate") return generateQR(e);
  if (path === "presence/checkin") return checkin(e);
  if (path === "presence/status") return presenceStatus(e);

  // ===== ACCEL =====
  if (path === "telemetry/accel") return accelPost(e);
  if (path === "telemetry/accel/latest") return accelLatest(e);

  // ===== GPS =====
  if (path === "telemetry/gps") return gpsPost(e);
  if (path === "telemetry/gps/latest") return gpsLatest(e);
  if (path === "telemetry/gps/history") return gpsHistory(e);

  return jsonResponse(false, "unknown_endpoint");
}

// ===================== RESPONSE =====================

function jsonResponse(ok, data) {
  return ContentService.createTextOutput(JSON.stringify(ok ? { ok: true, data } : { ok: false, error: data })).setMimeType(ContentService.MimeType.JSON);
}

// ===================================================
// =================== PRESENCE =======================
// ===================================================

// Generate QR Token
function generateQR(e) {
  const body = JSON.parse(e.postData.contents);

  const token = "TKN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const expires = new Date(Date.now() + 2 * 60 * 1000).toISOString();

  const sheet = SpreadsheetApp.getActive().getSheetByName("tokens");
  sheet.appendRow([token, body.course_id, body.session_id, expires]);

  return jsonResponse(true, {
    qr_token: token,
    expires_at: expires,
  });
}

// Check-in
function checkin(e) {
  const body = JSON.parse(e.postData.contents);

  const tokenSheet = SpreadsheetApp.getActive().getSheetByName("tokens");
  const tokenData = tokenSheet.getDataRange().getValues();

  let tokenValid = false;

  for (let i = 1; i < tokenData.length; i++) {
    const token = tokenData[i][0];
    const expires = new Date(tokenData[i][3]);

    if (token === body.qr_token) {
      if (new Date() > expires) {
        return jsonResponse(false, "token_expired");
      }

      tokenValid = true;
      break;
    }
  }

  if (!tokenValid) {
    return jsonResponse(false, "invalid_token");
  }

  const id = "PR-" + Utilities.getUuid();
  const sheet = SpreadsheetApp.getActive().getSheetByName("presence");

  sheet.appendRow([id, body.user_id, body.device_id, body.course_id, body.session_id, body.ts, "checked_in"]);

  return jsonResponse(true, {
    presence_id: id,
    status: "checked_in",
  });
}

// Status
function presenceStatus(e) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("presence");
  const data = sheet.getDataRange().getValues();

  const user = e.parameter.user_id;
  const course = e.parameter.course_id;
  const session = e.parameter.session_id;

  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][1] === user && data[i][3] === course && data[i][4] === session) {
      return jsonResponse(true, {
        user_id: user,
        course_id: course,
        session_id: session,
        status: data[i][6],
        last_ts: data[i][5],
      });
    }
  }

  return jsonResponse(false, "not_found");
}

// ===================================================
// ================= ACCELEROMETER ===================
// ===================================================

// POST batch
function accelPost(e) {
  const body = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActive().getSheetByName("accel");

  body.samples.forEach((s) => {
    sheet.appendRow([body.device_id, body.ts, s.t, s.x, s.y, s.z]);
  });

  return jsonResponse(true, { accepted: body.samples.length });
}

// GET latest
function accelLatest(e) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("accel");
  const data = sheet.getDataRange().getValues();

  const device = e.parameter.device_id;

  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][0] === device) {
      return jsonResponse(true, {
        t: data[i][2],
        x: data[i][3],
        y: data[i][4],
        z: data[i][5],
      });
    }
  }

  return jsonResponse(false, "not_found");
}

// ===================================================
// ====================== GPS =========================
// ===================================================

// POST GPS
function gpsPost(e) {
  const body = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActive().getSheetByName("gps");

  sheet.appendRow([body.device_id, body.ts, body.lat, body.lng, body.accuracy_m]);

  return jsonResponse(true, { accepted: true });
}

// GET latest
function gpsLatest(e) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("gps");
  const data = sheet.getDataRange().getValues();

  const device = e.parameter.device_id;

  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][0] === device) {
      return jsonResponse(true, {
        ts: data[i][1],
        lat: data[i][2],
        lng: data[i][3],
        accuracy_m: data[i][4],
      });
    }
  }

  return jsonResponse(false, "not_found");
}

// GET history
function gpsHistory(e) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("gps");
  const data = sheet.getDataRange().getValues();
  const device = e.parameter.device_id;

  let items = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === device) {
      items.push({
        ts: data[i][1],
        lat: data[i][2],
        lng: data[i][3],
      });
    }
  }

  return jsonResponse(true, {
    device_id: device,
    items: items,
  });
}
