import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.includes("/auth/login");
    const hadAuthHeader = !!error.config?.headers?.Authorization;

   if (error.response?.status === 401 && !isLogin && hadAuthHeader) {
  console.warn("401 received – letting app handle logout");
}


    return Promise.reject(error);
  }
);



// Auth APIs
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const data = response.data.data || response.data;

    if (!data.token) {
      throw new Error('No token received from server');
    }

    const expiryTime = Date.now() + 3 * 24 * 60 * 60 * 1000;

    // Clear any existing auth data first
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminExpiry");

    // Save new auth data
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminUser", JSON.stringify(data.user));
    localStorage.setItem("adminExpiry", expiryTime.toString());
    localStorage.setItem("adminLoginAt", Date.now().toString());


    // Verify it was saved
    if (!localStorage.getItem("adminToken")) {
      throw new Error('Failed to save token to localStorage');
    }

    return data;
  },
};


// Generic CRUD operations
export const createCRUD = (endpoint) => ({
  getAll: () => api.get(endpoint),

  getAllLanguages: () => api.get(endpoint + "/all"),

  getById: (id) => api.get(`${endpoint}/${id}`),

  create: (data, config = {}) => {
    const isFormData = data instanceof FormData;
    return api.post(endpoint, data, {
      headers: {
        ...(isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" }),
      },
      ...config,
    });
  },

  update: (id, data, config = {}) => {
    const isFormData = data instanceof FormData;
    return api.put(`${endpoint}/${id}`, data, {
      headers: {
        ...(isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" }),
      },
      ...config,
    });
  },

  delete: (id) => api.delete(`${endpoint}/${id}`),
});

// Model-specific APIs
export const chaptersAPI = {
  ...createCRUD("/chapters"),
  getAllLanguages: () => api.get("/chapters/all-languages"),
};
export const lessonsAPI = {
  ...createCRUD("/lessons"),
  getByChapter: (chapterId) => api.get(`/lessons/chapter-all/${chapterId}`),
};
export const topicsAPI = {
  ...createCRUD("/topics"),
  getAllLanguages: () => api.get("/topics/all-languages"),
};

export const lettersAPI = {
  getByLanguage: (lang) => api.get(`/letters/${lang}`),
};

export const questionsAPI = {
  ...createCRUD("/language-questions"),

  getByLangType: (langType) => api.get(`/questions/langType/${langType}`),
};

export const onboardingAPI = {
  ...createCRUD("/onboarding"),
  getUserOnboarding: (id) => api.get(`/onboarding-questions/user/${id}`),
};

export const UsersAPI = {
  ...createCRUD("/users"),

  // NEW: fetch user + onboarding answers in one call
  getUserWithOnboarding: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}`, { role }),
  deactivateUser: (id) => api.put(`/users/deactivate/${id}`),
};

export const rechargeAPI = {
  getAllHistory: () => api.get("/daily-limit/admin/recharge-history"),
};

export const subTopicsAPI = createCRUD("/atoz");
export const chatCategoriesAPI = createCRUD("/chat-categories");
export const quizzesAPI = createCRUD("/quizzes");
export const subscriptionsAPI = createCRUD("/plans");
export const discountsAPI = createCRUD("/discounts");
export const onBoardingAPI = createCRUD("/onboarding-questions");
export const grammarSubtopicsAPI = createCRUD("/grammar-subtopics");
export const languagesAPI = createCRUD("/languages");
export const nativeLang = createCRUD("/native-languages");

export const pushNotificationsAPI = {
  getAll: () => api.get("/push-notifications/all"),
  create: (data) => api.post("/push/push-to-all", data),
  getUserNotifications: (userId) => api.get(`/push/push-to-user/${userId}`),
};
export const pushMessagesAPI = createCRUD("/push-messages");

// File upload API
export const uploadFile = async (file, folder = "general") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export default api;
