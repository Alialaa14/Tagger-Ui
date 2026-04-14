import axios from "axios";

const API_BASE_URL = "/api/v1/company";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const companyApi = {
  // Public fetching
  getActiveCompanies: async () => {
    const response = await api.get("/");
    return response.data.data;
  },

  // Admin fetching
  getAllCompanies: async () => {
    const response = await api.get("/all");
    return response.data.data;
  },

  getCompanyById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.data;
  },

  createCompany: async (formData) => {
    const response = await api.post("/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  updateCompany: async (id, formData) => {
    const response = await api.put(`/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  toggleCompany: async (id) => {
    const response = await api.patch(`/${id}/toggle`);
    return response.data.data;
  },

  deleteCompany: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data.data;
  },
};
