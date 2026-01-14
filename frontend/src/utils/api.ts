import axios from "axios";

// Use relative URL for API calls - Vite proxy will handle routing to backend
// In production, the backend serves the frontend so relative URLs work directly
const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post("/auth/register", data),

  login: (data: { username: string; password: string }) =>
    api.post("/auth/login", data),

  verifyEmail: (data: { userId: number; code: string }) =>
    api.post("/auth/verify-email", data),

  resendCode: (data: { email: string }) => api.post("/auth/resend-code", data),

  logout: () => api.post("/auth/logout"),

  getMe: () => api.get("/auth/me"),

  forgotPassword: (data: { email: string }) =>
    api.post("/auth/forgot-password", data),

  resetPassword: (data: { token: string | null; password: string }) =>
    api.post("/auth/reset-password", data),

  verify: (data: { email: string; code: string }) =>
    api.post("/auth/verify", data),
};

export const profileAPI = {
  getPublicProfile: (username: string) => api.get(`/profile/${username}`),

  getMyProfile: () => api.get("/profile/me/profile"),

  updateProfile: (data: any) => api.put("/profile/me/profile", data),

  updateSettings: (data: any) => api.put("/profile/me/settings", data),

  addLink: (data: { title: string; url: string; icon?: string; platform?: string }) =>
    api.post("/profile/me/links", data),

  updateLink: (linkId: number, data: any) =>
    api.put(`/profile/me/links/${linkId}`, data),

  deleteLink: (linkId: number) => api.delete(`/profile/me/links/${linkId}`),

  reorderLinks: (linkIds: number[]) =>
    api.put("/profile/me/links/reorder", { linkIds }),

  trackClick: (username: string, linkId: number) =>
    api.post(`/profile/${username}/click/${linkId}`),

  uploadMedia: (formData: FormData) =>
    api.post("/profile/me/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const templatesAPI = {
  getMyTemplates: () => api.get("/templates/my"),

  createTemplate: (data: { name: string; settings: any }) =>
    api.post("/templates", data),

  getTemplateByCode: (code: string) => api.get(`/templates/${code}`),

  applyTemplate: (code: string) => api.post(`/templates/${code}/apply`),

  deleteTemplate: (id: number) => api.delete(`/templates/${id}`),
};

export const adminAPI = {
  getStats: () => api.get("/admin/stats"),

  getUsers: (page = 1, limit = 50) =>
    api.get(`/admin/users?page=${page}&limit=${limit}`),

  getUser: (userId: number) => api.get(`/admin/users/${userId}`),

  getUserByUid: (uid: string) => api.get(`/admin/users/uid/${uid}`),

  deleteUser: (userId: number) => api.delete(`/admin/users/${userId}`),

  banUser: (userId: number, reason: string) =>
    api.post(`/admin/users/${userId}/ban`, { reason }),

  unbanUser: (userId: number) => api.post(`/admin/users/${userId}/unban`),

  stripEffects: (userId: number) => api.post(`/admin/users/${userId}/strip-effects`),

  assignBadge: (userId: number, badgeId: number) =>
    api.post(`/admin/users/${userId}/badges`, { badgeId }),

  removeBadge: (userId: number, badgeId: number) =>
    api.delete(`/admin/users/${userId}/badges/${badgeId}`),

  grantAdmin: (identifier: string, type: "uid" | "discord") =>
    api.post("/admin/grant-admin", { identifier, type }),

  getAuditLog: (page = 1, limit = 50) =>
    api.get(`/admin/audit-log?page=${page}&limit=${limit}`),

  updateUserStatus: (
    userId: number,
    data: { isVerified?: boolean; isAdmin?: boolean },
  ) => api.put(`/admin/users/${userId}/status`, data),

  getActivity: () => api.get("/admin/activity"),
};

export default api;
