import axios from "axios";

export const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API_BASE });

export const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("tc_admin_token") || ""}` },
});

export const formatApiError = (e) => {
  const detail = e?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(" ");
  return e?.message || "Something went wrong";
};
