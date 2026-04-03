import axios from 'axios';
import { unwrapPayload, withCreds } from './admin/shared';

const REVIEW_BASE = 'http://localhost:3000/api/v1/review';

/**
 * Creates a new review
 * @param {Object} data { stars: number, content: string }
 */
export async function createReview(data) {
  const res = await axios.post(REVIEW_BASE, data, withCreds());
  return unwrapPayload(res);
}

/**
 * Fetches the current user's reviews
 * @param {Object} params { page: number, limit: number }
 */
export async function getMyReviews(params = { page: 1, limit: 10 }) {
  const res = await axios.get(`${REVIEW_BASE}/my`, { ...withCreds(), params });
  return unwrapPayload(res);
}

/**
 * Updates a specific review
 * @param {string} id 
 * @param {Object} data { stars?: number, content?: string }
 */
export async function updateReview(id, data) {
  if (!id) throw new Error("Review ID is required");
  const res = await axios.patch(`${REVIEW_BASE}/${id}`, data, withCreds());
  return unwrapPayload(res);
}

/**
 * Deletes a specific review
 * @param {string} id 
 */
export async function deleteReview(id) {
  if (!id) throw new Error("Review ID is required");
  const res = await axios.delete(`${REVIEW_BASE}/${id}`, withCreds());
  return unwrapPayload(res);
}
