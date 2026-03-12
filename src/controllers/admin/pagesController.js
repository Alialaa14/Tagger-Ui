import axios from "axios";
import { API_BASE, pickArray, pickObject, requestWithFallback, unwrapPayload, withCreds } from "./shared";

const PAGE_BASE = `${API_BASE}/page`;

function pickPages(payload) {
  return pickArray(payload, ["pages", "results"]);
}

function pickPage(payload) {
  return pickObject(payload, ["page"]);
}

export async function fetchPages() {
  const response = await requestWithFallback(
    [
      () => axios.get(PAGE_BASE, withCreds()),
      () => axios.get(`${API_BASE}/pages`, withCreds()),
    ],
    "No pages endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickPages(payload);
}

export async function fetchPageBySlug(slug) {
  if (!slug) throw new Error("slug is required");
  const response = await requestWithFallback(
    [
      () => axios.get(`${PAGE_BASE}/${slug}`, withCreds()),
      () => axios.get(`${API_BASE}/pages/${slug}`, withCreds()),
    ],
    "No page endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickPage(payload) || payload;
}

export async function updatePageBySlug(slug, updates) {
  if (!slug) throw new Error("slug is required");
  const response = await requestWithFallback(
    [
      () => axios.patch(`${PAGE_BASE}/${slug}`, updates, withCreds()),
      () => axios.put(`${PAGE_BASE}/${slug}`, updates, withCreds()),
      () => axios.patch(`${API_BASE}/pages/${slug}`, updates, withCreds()),
    ],
    "No page update endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickPage(payload) || payload;
}

export async function updateHomePage(updates) {
  return updatePageBySlug("home", updates);
}
