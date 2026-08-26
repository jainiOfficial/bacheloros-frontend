import apiClient from './client';

interface LoginPayload {
  email: string;
  password: string;
}

interface SignupPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const login = (payload: LoginPayload) =>
  apiClient.post('/auth/login', payload);

export const signup = (payload: SignupPayload) =>
  apiClient.post('/auth/signup', payload);

