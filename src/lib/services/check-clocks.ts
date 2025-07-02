import api from "../api";

export interface CheckClockRecord {
  id: number;
  employee_id: number;
  FirstName: string;
  LastName: string;
  employee_name: string;
  position: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  work_hours: string | null;
  approved: boolean | null;
  status: string;
  location: string | null;
  detail_address: string | null;
  latitude: string | null;
  longitude: string | null;
  proof_of_attendance: string | null;
}

export interface ApiResponse {
  status: number;
  message: string;
  data: CheckClockRecord[];
}

export const getAllCheckClocks = async (): Promise<CheckClockRecord[]> => {
  try {
    console.log("Fetching checkclocks from:", "/admin/checkclocks");
    const response = await api.get<ApiResponse>("/admin/checkclocks");
    console.log("Response received:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching check clocks:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const getCheckClockById = async (id: number): Promise<CheckClockRecord | null> => {
  try {
    const response = await api.get<{status: number; message: string; data: CheckClockRecord}>(`/admin/checkclocks/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching check clock:", error);
    return null;
  }
};

export const updateCheckClock = async (id: number, data: Partial<CheckClockRecord>): Promise<CheckClockRecord | null> => {
  try {
    const response = await api.put<{status: number; message: string; data: CheckClockRecord}>(`/admin/checkclocks/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error("Error updating check clock:", error);
    throw error;
  }
};

export const approveCheckClock = async (id: number): Promise<CheckClockRecord | null> => {
  try {
    const response = await api.put<{status: number; message: string; data: CheckClockRecord}>(`/admin/checkclocks/${id}/approve`);
    return response.data.data;
  } catch (error) {
    console.error("Error approving check clock:", error);
    throw error;
  }
};

export const rejectCheckClock = async (id: number): Promise<CheckClockRecord | null> => {
  try {
    const response = await api.put<{status: number; message: string; data: CheckClockRecord}>(`/admin/checkclocks/${id}/reject`);
    return response.data.data;
  } catch (error) {
    console.error("Error rejecting check clock:", error);
    throw error;
  }
};

export const exportCheckClocks = async (filters?: {
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  positions?: string[];
  statuses?: string[];
}): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    if (filters?.positions && filters.positions.length > 0) {
      filters.positions.forEach(position => params.append('positions[]', position));
    }
    if (filters?.statuses && filters.statuses.length > 0) {
      filters.statuses.forEach(status => params.append('statuses[]', status));
    }

    const url = `/admin/checkclocks/export${params.toString() ? '?' + params.toString() : ''}`;
    console.log("Exporting check clocks with URL:", url);
    
    const response = await api.get(url, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting check clocks:", error);
    throw error;
  }
};

export interface Employee {
  id: number;
  FirstName: string;
  LastName: string;
  full_name: string;
  EmployeeID: string;
  position_name: string;
  division_name: string;
  branch_name: string;
  Branch_id: number;
  Division_id: number;
  Position_id: number;
}

export interface EmployeeApiResponse {
  status: number;
  message: string;
  data: Employee[];
}

export const getEmployeesForCheckClock = async (): Promise<Employee[]> => {
  try {
    console.log("Fetching employees for check clock from:", "/admin/checkclocks/employees");
    const response = await api.get<EmployeeApiResponse>("/admin/checkclocks/employees");
    console.log("Employee response received:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching employees for check clock:", error);
    throw error;
  }
};

export const getCheckClocksWithFilters = async (filters: {
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  positions?: string[];
  statuses?: string[];
}): Promise<CheckClockRecord[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.month) params.append('month', filters.month.toString());
    if (filters.year) params.append('year', filters.year.toString());
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.positions && filters.positions.length > 0) {
      filters.positions.forEach(position => params.append('positions[]', position));
    }
    if (filters.statuses && filters.statuses.length > 0) {
      filters.statuses.forEach(status => params.append('statuses[]', status));
    }

    console.log("Fetching filtered checkclocks from:", `/admin/checkclocks/filter?${params.toString()}`);
    const response = await api.get<ApiResponse>(`/admin/checkclocks/filter?${params.toString()}`);
    console.log("Filtered response received:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching filtered check clocks:", error);
    throw error;
  }
};
