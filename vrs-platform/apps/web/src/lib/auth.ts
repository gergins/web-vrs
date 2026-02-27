export function login() {
  window.location.href = "/api/auth/login";
}

export function getToken() {
  return localStorage.getItem("id_token");
}
