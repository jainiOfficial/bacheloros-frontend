import apiClient from './client';

export interface memberInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
}
export const getMemberInfo=()=>{
    return apiClient.get<memberInfo>('/users/me');

};
