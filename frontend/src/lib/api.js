import axios from "axios";
import { API } from "./constants";

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export default api;
