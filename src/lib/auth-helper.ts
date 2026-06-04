export const authHelper = {
  getToken: () => typeof window !== "undefined" ? localStorage.getItem("token") : null,
  setToken: (token: string) => localStorage.setItem("token", token),
  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },
  isAuthenticated: () => !!(typeof window !== "undefined" && localStorage.getItem("token")),
};
