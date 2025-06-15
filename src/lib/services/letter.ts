import { ApiError } from 'next/dist/server/api-utils';
import api from '../api';

export const getLetters = () => api.get('/letters')
export const createLetter = (formData: FormData) => api.post('/letters', formData);

export const addLetter = async (data: FormData) => {
  const res = await api.post("/letters", data); 
  return res.data;
};
