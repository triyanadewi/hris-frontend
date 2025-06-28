import api from "../api";
import Cookies from "js-cookie";
import axios from "axios";

interface RegisterAdminRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Function to get CSRF cookie for stateful authentication
export const getCsrfToken = async (): Promise<void> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://127.0.0.1:8000";
    await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error("Failed to get CSRF token:", error);
  }
};

export const registerAdmin = async (request: RegisterAdminRequest) => {
  try {
    const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/register`, request);
    return response.data;
  } catch {
    return "Registration failed. Please try again.";
  }
};

export const loggedInAsAdmin = async (
  email: string,
  password: string
): Promise<string | undefined> => {
  try {
    // Get CSRF token first for stateful auth
    await getCsrfToken();
    
    const response = await api.post("/admin/login", {
      email,
      password,
    });

    if (response.data && response.data.token) {
      Cookies.set("token", response.data.token, {
        expires: 1,
      });
      // Periksa apakah profil perusahaan belum diisi
      const isProfileCompany = response.data.admin?.isProfileCompany;

      if (!isProfileCompany) {
        // Redirect ke halaman CompanyProfile
        window.location.href = "http://localhost:3000/CompanyProfile";
      }
      return undefined; // Success, no error
    } else {
      return "Invalid response from server.";
    }
  } catch (error: any) {
    console.error("Login error:", error);
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error;
      
      if (status === 401) {
        return "Invalid email or password.";
      } else if (status === 419) {
        return "Authentication error. Please ensure your backend is properly configured for API authentication.";
      } else if (status === 422) {
        return message || "Validation error. Please check your input.";
      } else if (status === 500) {
        return "Server error. Please try again later.";
      } else {
        return message || "Login failed. Please try again.";
      }
    } else if (error.request) {
      // Network error
      return "Network error. Please check your connection and ensure the backend server is running.";
    } else {
      // Other error
      return "Login failed. Please check your credentials.";
    }
  }
};

export const loggedInAsEmployee = async (
  idEmployee: string,
  email: string,
  password: string
): Promise<string | undefined> => {
  try {
    // Get CSRF token first for stateful auth
    await getCsrfToken();
    
    const response = await api.post("/user/login", {
      idEmployee,
      email,
      password,
    });

    if (response.data && response.data.token) {
      Cookies.set("token", response.data.token, {
        expires: 1,
      });
      return undefined; // Success, no error
    } else {
      return "Invalid response from server.";
    }
  } catch (error: any) {
    console.error("Employee login error:", error);
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error;
      
      if (status === 401) {
        return "Invalid credentials.";
      } else if (status === 419) {
        return "Authentication error. Please ensure your backend is properly configured for API authentication.";
      } else if (status === 422) {
        return message || "Validation error. Please check your input.";
      } else if (status === 500) {
        return "Server error. Please try again later.";
      } else {
        return message || "Login failed. Please try again.";
      }
    } else if (error.request) {
      // Network error
      return "Network error. Please check your connection and ensure the backend server is running.";
    } else {
      // Other error
      return "Login failed. Please check your credentials.";
    }
  }
};

export const loggedOutAdmin = async (): Promise<void> => {
  try {
    await api.post("/admin/logout");
    Cookies.remove("token");
  } catch {
    throw new Error("Logout failed. Please try again.");
  }
};
