import axios, { AxiosResponse } from 'axios';
import api from '@/lib/api';

// Interface untuk Position (nested di dalam Division)
export interface Position {
  id?: number;
  name: string;
  description?: string;
}

// Interface untuk Division (nested di dalam Branch, berisi Positions)
export interface Division {
  id?: number;
  name: string;
  description?: string;
  positions: Position[];  // ← Positions nested di dalam Division
}

// Interface untuk Branch (berisi Divisions)
export interface Branch {
  id?: number;
  name: string;
  branch_address: string;
  branch_phone: string;
  branch_phone_backup?: string;
  description?: string;
  divisions: Division[];  // ← Divisions nested di dalam Branch
}

// Interface untuk data yang dikirim ke API (NESTED STRUCTURE)
export interface CompanyDetailsData {
  branches: Branch[];  // ← Hanya branches, divisions dan positions ada di dalamnya
}

// Interface untuk response dari getBranches (yang sudah ada di database)
export interface ExistingBranch {
  id: number;
  company_id: number;
  name: string;
  branch_address: string;
  branch_phone: string;
  branch_phone_backup?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  divisions: ExistingDivision[];
}

export interface ExistingDivision {
  id: number;
  branch_id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  positions: ExistingPosition[];
}

export interface ExistingPosition {
  id: number;
  division_id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInfo {
  subscription: {
    id: number;
    company_id: number;
    package_id: number;
    extra_branch: number;
    extra_employee: number;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
  };
  package_benefit: {
    id: number;
    package_id: number;
    max_branches: number;
    max_employees: number;
    access_duration_days: number;
    is_active: boolean;
  };
  max_branches: number;
  max_employees: number;
  current_branch_count: number;
  remaining_branches: number;
  subscription_ends_at: string;
  is_active: boolean;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

/**
 * Save company details (branches with nested divisions and positions)
 */
export const saveCompanyDetails = async (data: CompanyDetailsData): Promise<ApiResponse<any>> => {
  try {
    // Debug: Log data yang akan dikirim
    console.log('Sending data to API:', JSON.stringify(data, null, 2));
    
    // Validasi sebelum kirim
    if (!data.branches || data.branches.length === 0) {
      throw new Error('At least one branch is required');
    }
    
    // Validasi setiap branch harus punya divisions
    data.branches.forEach((branch, branchIndex) => {
      if (!branch.divisions || branch.divisions.length === 0) {
        throw new Error(`Branch ${branchIndex + 1} must have at least one division`);
      }
      
      // Validasi setiap division harus punya positions
      branch.divisions.forEach((division, divisionIndex) => {
        if (!division.positions || division.positions.length === 0) {
          throw new Error(`Division ${divisionIndex + 1} in Branch ${branchIndex + 1} must have at least one position`);
        }
      });
    });
    
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/company-details', data);
    return response.data;
  } catch (error: any) {
    console.error('API Error Details:', error.response?.data);
    if (axios.isAxiosError(error)) {
      // Handle validation errors
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat().join(', ');
          throw new Error(`Validation Error: ${errorMessages}`);
        }
      }
      throw new Error(error.response?.data?.message || 'Failed to save company details');
    }
    throw new Error('Failed to save company details');
  }
};

/**
 * Get subscription information including branch limits
 */
export const getSubscriptionInfo = async (): Promise<SubscriptionInfo> => {
  try {
    const response: AxiosResponse<ApiResponse<SubscriptionInfo>> = await api.get('/company-details/subscription-info');
    return response.data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to get subscription info');
    }
    throw new Error('Failed to get subscription info');
  }
};

/**
 * Get existing branches (with nested divisions and positions)
 */
export const getBranches = async (): Promise<ExistingBranch[]> => {
  try {
    const response: AxiosResponse<ApiResponse<ExistingBranch[]>> = await api.get('/company-details/branches');
    return response.data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to get branches');
    }
    throw new Error('Failed to get branches');
  }
};

/**
 * Validate if user can add more branches
 */
export const validateBranchLimit = async (requestedBranchCount: number): Promise<boolean> => {
  try {
    const subscriptionInfo = await getSubscriptionInfo();
    return requestedBranchCount <= subscriptionInfo.max_branches;
  } catch (error) {
    console.error('Error validating branch limit:', error);
    return false;
  }
};

/**
 * Get remaining branch quota
 */
export const getRemainingBranchQuota = async (): Promise<number> => {
  try {
    const subscriptionInfo = await getSubscriptionInfo();
    return subscriptionInfo.remaining_branches;
  } catch (error) {
    console.error('Error getting remaining branch quota:', error);
    return 0;
  }
};

// Helper function untuk membuat data structure yang benar
export const createCompanyDetailsData = (
  branchName: string,
  branchAddress: string,
  branchPhone: string,
  divisions: Array<{
    name: string;
    description?: string;
    positions: Array<{
      name: string;
      description?: string;
    }>;
  }>,
  branchPhoneBackup?: string,
  branchDescription?: string
): CompanyDetailsData => {
  return {
    branches: [
      {
        name: branchName,
        branch_address: branchAddress,
        branch_phone: branchPhone,
        branch_phone_backup: branchPhoneBackup,
        description: branchDescription,
        divisions: divisions
      }
    ]
  };
};