import axios from 'axios';
import { unwrapPayload, withCreds } from './shared';

const REVIEW_BASE = 'http://localhost:3000/api/v1/review';

/**
 * Fetches all reviews across the platform
 * @param {Object} params { page: number, limit: number }
 */
export async function getAllReviews(params = { page: 1, limit: 10 }) {
  const res = await axios.get(REVIEW_BASE, { ...withCreds(), params });
  return unwrapPayload(res);
}

/**
 * Fetches a single review by its ID
 * @param {string} id 
 */
export async function getReviewById(id) {
  if (!id) throw new Error("Review ID is required");
  const res = await axios.get(`${REVIEW_BASE}/${id}`, withCreds());
  return unwrapPayload(res);
}

/**
 * Admin deletes a review
 * @param {string} id 
 */
export async function deleteReviewAdmin(id) {
  if (!id) throw new Error("Review ID is required");
  const res = await axios.delete(`${REVIEW_BASE}/${id}`, withCreds());
  return unwrapPayload(res);
}
