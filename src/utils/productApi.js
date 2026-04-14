import axios from "axios";

const API_BASE_URL = "/api/v1/product";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const productApi = {
  /**
   * Fetch products with various filters
   * @param {Object} params - { search, page, limit, minPrice, maxPrice, category, company, sortBy, sortOrder }
   */
  getProducts: async (params = {}) => {
    // Basic pagination defaults
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 12,
      ...params
    };

    // Construct URLSearchParams to handle arrays or special characters if needed
    const searchParams = new URLSearchParams();
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== '') {
        searchParams.append(key, queryParams[key]);
      }
    });

    const response = await api.get(`/?${searchParams.toString()}`);
    return response.data.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.data;
  }
};
