import api from "../api";

export const getAllCheckClocks = async () => {
  try {
    const response = await api.get("/admin/check-clocks");
    return response.data.data || [];
  } catch {
    return [];
  }
};
