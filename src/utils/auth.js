export function getToken() {
  return localStorage.getItem("eventhub_token");
}

export function getRole() {
  return localStorage.getItem("eventhub_role");
}

export function setAuth(token, role) {
  localStorage.setItem("eventhub_token", token);
  localStorage.setItem("eventhub_role", role);
}

export function logout() {
  localStorage.removeItem("eventhub_token");
  localStorage.removeItem("eventhub_role");
}