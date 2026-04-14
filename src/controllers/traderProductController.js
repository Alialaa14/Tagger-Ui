import axios from "axios";
import { API_BASE, pickArray, withCreds, unwrapPayload } from "./admin/shared";

const BASE_URL = `${API_BASE}/trader-products`;

/**
 * Fetch the platform catalog (all products)
 */
export async function fetchPlatformCatalog(params = {}) {
  const response = await axios.get(`/api/v1/product/catalog`, withCreds({ params }));
  return unwrapPayload(response);
}

/**
 * Fetch products listed by the current trader
 */
export async function fetchMyListedProducts(params = {}) {
  const response = await axios.get(`${BASE_URL}/my`, withCreds({ params }));
  return unwrapPayload(response);
}

/**
 * Add a platform product to the trader's store
 */
export async function addProductToStore(data) {
  const response = await axios.post(`${BASE_URL}/my`, data, withCreds());
  return unwrapPayload(response);
}

/**
 * Update a listed product's price or quantity
 */
export async function updateListedProduct(id, data) {
  const response = await axios.patch(`${BASE_URL}/${id}`, data, withCreds());
  return unwrapPayload(response);
}

/**
 * Remove a product from the trader's store
 */
export async function removeProductFromStore(id) {
  const response = await axios.delete(`${BASE_URL}/${id}`, withCreds());
  return unwrapPayload(response);
}
