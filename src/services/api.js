const BASE_URL = "http://localhost:8081";

export async function api(
  path,
  {
    method = "GET",
    body,
    auth = true
  } = {}
) {
  const token = localStorage.getItem("eventhub_token");

  const headers = {
    "Content-Type": "application/json"
  };

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();

  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      data?.message || "Something went wrong with the request."
    );
  }

  return data;
}

export function login(email, password) {
  return api("/api/auth/login", {
    method: "POST",
    auth: false,
    body: {
      email,
      password
    }
  });
}

export function register(data) {
  return api("/api/auth/register", {
    method: "POST",
    auth: false,
    body: data
  });
}