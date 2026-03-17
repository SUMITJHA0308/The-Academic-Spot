import axios from "axios";

const API = axios.create({
  baseURL: "https://the-academic-spot.onrender.com",
});

export default API;
