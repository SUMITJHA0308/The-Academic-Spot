import axios from "axios";

const API = axios.create({
  baseURL: "https://the-academic-spot-2.onrender.com",
});

export default API;
