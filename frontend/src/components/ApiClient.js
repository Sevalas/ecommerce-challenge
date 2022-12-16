import axios from "axios";

axios.interceptors.request.use(
  (config) => {
    if (localStorage.getItem("userInfo")) {
      const { token } = JSON.parse(localStorage.getItem("userInfo"));
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
