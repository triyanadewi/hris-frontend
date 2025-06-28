import api from '../api';

export interface CompanyFormData {
  name: string;
  email: string;
  head_office_phone: string;
  head_office_phone_backup?: string;
  head_office_address: string;
  description?: string;
}

export interface CompanyData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
}

export async function createCompany(data: CompanyFormData) {
  try {
    const response = await api.post('/admin/companies', data);
    return response.data;
  } catch (error: any) {
    // Kirimkan error response ke frontend untuk penanganan
    if (error.response) {
      throw error.response.data;
    }
    throw new Error('An unexpected error occurred.');
  }
}

export async function getAuthenticatedCompany(): Promise<CompanyData> {
  try {
    const response = await api.get('/admin/company/me');
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw error.response.data;
    }
    throw new Error('Failed to fetch company data');
  }
}