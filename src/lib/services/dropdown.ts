// lib/services/dropdown.ts
import api from '../api';

export interface Branch {
  id: number;
  name: string;
  company_id: number;
}

export interface Division {
  id: number;
  name: string;
  branch_id: number;
}

export interface Position {
  id: number;
  name: string;
  division_id: number;
}

// Get branches by company
export const getBranches = () => {
   return api.get("/api/branches?company_id=1");
  // return api.get(`/employee/branches?company_id=${companyId}`);
};

// Get divisions by branch
export const getDivisionsByBranch = (branchId: number, companyId: number = 1) => {
  return api.get(`/employee/divisions/${branchId}?company_id=${companyId}`);
};

// Get positions by division
export const getPositionsByDivision = (divisionId: number, companyId: number = 1) => {
  return api.get(`/employee/positions/${divisionId}?company_id=${companyId}`);
};