const API_URL = "http://localhost:8000";

const buildHeaders = (json = true) => {
  const headers = {};
  if (json) headers["Content-Type"] = "application/json";

  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
};

export const apiPost = async (path, body) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json();
};

export const apiGet = async (path) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: buildHeaders(false),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json();
};

export async function apiPostForm(path, formData) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
}

