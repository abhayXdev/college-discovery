export const authHelper = {
  getToken: () => typeof window !== "undefined" ? localStorage.getItem("token") : null,
  setToken: (token: string) => {
    localStorage.setItem("token", token);
    window.dispatchEvent(new Event("auth-change"));
  },
  logout: () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change"));
  },
  isAuthenticated: () => !!(typeof window !== "undefined" && localStorage.getItem("token")),
};
