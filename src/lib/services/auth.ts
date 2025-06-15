import api from "../api";
import Cookies from "js-cookie";

interface RegisterAdminRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const registerAdmin = async (request: RegisterAdminRequest) => {
  try {
    const response = await api.post("/admin/register", request);
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
    const response = await api.post("/admin/login", {
      email,
      password,
    });

    Cookies.set("token", response.data.token, {
      expires: 1,
    });
  } catch {
    return "Login failed. Please check your credentials.";
  }
};

export const loggedInAsEmployee = async (
  idEmployee: string,
  email: string,
  password: string
): Promise<string | undefined> => {
  try {
    const response = await api.post("/user/login", {
      idEmployee,
      email,
      password,
    });

    Cookies.set("token", response.data.token, {
      expires: 1,
    });
  } catch {
    return "Login failed. Please check your credentials.";
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
