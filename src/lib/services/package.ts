import api from "../api";

// Types
export interface PackageBenefit {
  id: number;
  package_id: number;
  max_branches: number;
  max_employees: number;
  access_duration_days: number;
  is_active: boolean;
}

export interface Package {
  id: number;
  name: string;
  price: number;
  description: string;
  benefits: PackageBenefit[];
  features?: string[];
}

export interface CreateOrderRequest {
  package_benefits_id: number;
  add_branch?: number;
  add_employees?: number;
  company_name: string;
  email: string;
  phone_number: string;
}

export interface UpdateOrderRequest {
  add_branch?: number;
  add_employees?: number;
  company_name?: string;
  email?: string;
  phone_number?: string;
}

export interface OrderResponse {
  id: number;
  package: {
    id: number;
    name: string;
    description: string;
    price: number;
  };
  benefit: {
    id: number;
    max_branches: number;
    max_employees: number;
    access_duration_days: number;
  };
  company: {
    name: string;
    email: string;
    phone: string;
  };
  addons: {
    branches: number;
    employees: number;
  };
  pricing: {
    base_price: number;
    branch_cost: number;
    employee_cost: number;
    subtotal: number;
    tax: number;
    total: number;
  };
  status: string;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

// Package Services
export const getAllPackages = async (): Promise<Package[]> => {
  const response = await api.get("/admin/packages");
  return response.data;
};

export const getPackages = async (): Promise<Package[]> => {
  const response = await api.get('/admin/packages');
  return response.data;
};

// Company Services
export const getMyCompany = async (): Promise<Company> => {
  const response = await api.get("/admin/company/fixed");
  return response.data;
};

export const getCompanyForCheckout = async (): Promise<Company> => {
  const response = await api.get("/admin/company/fixed");
  return response.data;
};

// Order Services
export const createOrder = async (data: CreateOrderRequest) => {
  const response = await api.post("/admin/packages/order", data);
  return response.data;
};

export const getOrderWithCompany = async (orderId: number): Promise<OrderResponse> => {
  const response = await api.get(`/admin/packages/order/${orderId}`);
  return response.data;
};

export const updateOrder = async (orderId: number, data: UpdateOrderRequest) => {
  const response = await api.put(`/admin/packages/order/${orderId}`, data);
  return response.data;
};

// Payment Services
export const confirmPayment = async (orderId: number, data: {
  payment_method: string;
  payment_reference?: string;
}) => {
  const response = await api.post(`/admin/packages/order/${orderId}/confirm-payment`, data);
  return response.data;
};

export const cancelOrder = async (orderId: number) => {
  const response = await api.delete(`/admin/packages/order/${orderId}/cancel`);
  return response.data;
};

// Utility functions for formatting
export const formatAccessDuration = (days: number): string => {
  if (days <= 30) {
    return `${days} days access`;
  } else if (days <= 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? "s" : ""} access`;
  } else {
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? "s" : ""} access`;
  }
};

export const formatEmployeeLimit = (count: number): string => {
  if (count >= 1000000) {
    return "Unlimited employees";
  }
  return `Up to ${count.toLocaleString()} employees`;
};

export const formatBranchLimit = (count: number): string => {
  if (count >= 1000000) {
    return "Unlimited branch offices";
  } else if (count === 1) {
    return "Head Office only";
  }
  return `Head Office with ${count - 1} branch office${count > 2 ? "s" : ""}`;
};

export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString()}`;
};