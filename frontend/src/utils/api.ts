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
  getPublicProfile: (username: string) => api.get(`/profile/${encodeURIComponent(username)}`),

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
    api.post(`/profile/${encodeURIComponent(username)}/click/${linkId}`),

  uploadMedia: (formData: FormData) =>
    api.post("/profile/me/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getMyBadges: () => api.get("/profile/me/badges"),

  getMyLinks: () => api.get("/profile/me/links"),
};

export const templatesAPI = {
  getMyTemplates: () => api.get("/templates/my"),

  getPublicTemplates: (page = 1, limit = 20, search?: string, sort = 'trending') =>
    api.get(`/templates?page=${page}&limit=${limit}&sort=${sort}${search ? `&search=${encodeURIComponent(search)}` : ''}`),

  createTemplate: (data: { name: string; settings: any; tags?: string[]; is_public?: boolean }) =>
    api.post("/templates", data),

  getTemplateByCode: (code: string) => api.get(`/templates/${code}`),

  applyTemplate: (code: string) => api.post(`/templates/${code}/apply`),

  deleteTemplate: (id: number) => api.delete(`/templates/${id}`),

  favoriteTemplate: (templateId: number) => api.post(`/templates/${templateId}/favorite`),

  unfavoriteTemplate: (templateId: number) => api.delete(`/templates/${templateId}/favorite`),

  getFavoriteTemplates: () => api.get("/templates/favorites"),

  getLastUsedTemplates: () => api.get("/templates/last-used"),
};

export const adminAPI = {
  // Stats
  getStats: () => api.get("/admin/stats"),

  // Users
  getUsers: (page = 1, limit = 50, search?: string) =>
    api.get(`/admin/users?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`),

  getUser: (userId: number) => api.get(`/admin/users/${userId}`),

  getUserByUid: (uid: number) => api.get(`/admin/users/uid/${uid}`),

  deleteUser: (userId: number) => api.delete(`/admin/users/${userId}`),

  updateUserStatus: (
    userId: number,
    data: { isVerified?: boolean; isAdmin?: boolean },
  ) => api.put(`/admin/users/${userId}/status`, data),

  // Banning
  banUser: (userId: number, reason: string) =>
    api.post("/admin/ban", { userId, reason }),

  unbanUser: (userId: number) => api.post("/admin/unban", { userId }),

  getBannedUsers: () => api.get("/admin/banned"),

  // Badges
  getBadges: () => api.get("/admin/badges"),

  createBadge: (data: { name: string; description?: string; icon: string; color?: string }) =>
    api.post("/admin/badges", data),

  updateBadge: (badgeId: number, data: { name?: string; description?: string; icon?: string; color?: string }) =>
    api.put(`/admin/badges/${badgeId}`, data),

  deleteBadge: (badgeId: number) => api.delete(`/admin/badges/${badgeId}`),

  assignBadge: (userId: number, badgeId: number) =>
    api.post(`/admin/users/${userId}/badges`, { badgeId }),

  removeBadge: (userId: number, badgeId: number) =>
    api.delete(`/admin/users/${userId}/badges/${badgeId}`),

  // Email
  sendEmail: (userId: number, subject: string, message: string, fromName?: string) =>
    api.post("/admin/send-email", { userId, subject, message, fromName }),

  sendBulkEmail: (subject: string, message: string, filter?: string, fromName?: string) =>
    api.post("/admin/send-bulk-email", { subject, message, filter, fromName }),

  // Effects
  stripEffects: (userId: number, options: { stripBackground?: boolean; stripEffects?: boolean; stripAudio?: boolean }) =>
    api.post("/admin/strip-effects", { userId, ...options }),

  // Audit & Activity
  getAuditLogs: (page = 1, limit = 50) =>
    api.get(`/admin/audit-logs?page=${page}&limit=${limit}`),

  getActivity: () => api.get("/admin/activity"),

  // Owner functions
  verifyOwner: (secret: string) => api.post("/admin/owner/verify", { secret }),

  grantAdmin: (uid?: number, discordId?: string) =>
    api.post("/admin/owner/grant-admin", { uid, discordId }),

  revokeAdmin: (uid: number) => api.post("/admin/owner/revoke-admin", { uid }),
};

export default api;
