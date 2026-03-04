const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function apiRequest(path, method = "GET", body = null) {

  let url = `${BASE_URL}?path=${encodeURIComponent(path)}`;

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    }
  };

  if (method === "POST" && body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  return await res.json();
}

export { BASE_URL };