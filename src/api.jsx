import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // Replace with your backend's base URL
});

export default API;
