// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/login",
      REGISTER: "/register",
      LOGOUT: "/logout",
    },
    ADMIN: {
      REGISTER: "/admin/register",
      DASHBOARD: "/admin/dashboard",
    },
    USER: {
      PROFILE: "/user/profile",
      DASHBOARD: "/user/dashboard",
    },
    CHECKCLOCK: "/checkclock",
    EMPLOYEE: "/employee",
    LETTER: "/letter",
    COMPANY: "/company",
  }
};

// Helper function untuk build full URL
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function untuk fetch dengan base configuration
export const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const url = buildApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};
