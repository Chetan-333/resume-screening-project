// Central place for all API calls to the FastAPI backend.
// Example usage in a component:
//   import { rankResumes } from "../api/client";

import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// export async function rankResumes(formData) {
//   const res = await api.post("/api/rank", formData);
//   return res.data;
// }
