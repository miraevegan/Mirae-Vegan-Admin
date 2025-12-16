export const saveToken = (token: string) => {
  localStorage.setItem("mirae_admin_token", token);
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mirae_admin_token");
};

export const logout = () => {
  localStorage.removeItem("mirae_admin_token");
  window.location.href = "/";
};
