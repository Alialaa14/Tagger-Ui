import axios from "axios";

const BASE_URL = "/api/v1/banners";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const bannerApi = {
  // GET /api/v1/banners — active only
  getActiveBanners: async () => {
    const response = await api.get("/");
    return response.data.data;
  },

  // GET /api/v1/banners/all — all banners (admin)
  getAllBanners: async () => {
    const response = await api.get("/all");
    return response.data.data;
  },

  // GET /api/v1/banners/:id — single banner
  getBannerById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.data;
  },

  // POST /api/v1/banners — create
  createBanner: async (formData) => {
    const response = await api.post("/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  // PUT /api/v1/banners/:id — update
  updateBanner: async (id, formData) => {
    const response = await api.put(`/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  // PATCH /api/v1/banners/:id/toggle — toggle isActive
  toggleBanner: async (id) => {
    const response = await api.patch(`/${id}/toggle`);
    return response.data.data;
  },

  // DELETE /api/v1/banners/:id — delete
  deleteBanner: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data.data;
  },
};
