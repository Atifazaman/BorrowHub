import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api"
});

// Add token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Automatically logout when token expires
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
      if (
            error.response?.status === 401 &&
            !error.config?.url?.includes("/users/login")
        ) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;