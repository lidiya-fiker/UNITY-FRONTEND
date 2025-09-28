export const API_URL = import.meta.env.VITE_API_URL;

export const ENDPOINTS = {
  AVAILABLE_SLOTS: `${API_URL}/api/available-slots`,
  BOOKINGS: `${API_URL}/bookings`,
  REVIEWS: `${API_URL}/reviews`,
  COUNSELORS_APPROVED: `${API_URL}/counselors/approved`,
  ARTICLES: `${API_URL}/articles`,
};
