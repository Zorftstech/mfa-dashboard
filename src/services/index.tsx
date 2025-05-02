// api with auth
const store = JSON.parse(localStorage.getItem('user') || '{}');
const token = store?.state?.user?.access_token || '';
const client = store?.state?.user?.client || '';
const uid = store?.state?.user?.uid || '';
// const mtierToken = store?.state?.user?.mtierToken || ''

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export const services = () => {
  const service = axios.create({
    baseURL: 'https://api.loystar.co/api/v2/',
    headers: {
      'Content-Type': 'application/json',

      "Accept":"application/json, text/plain, */*",
      "access-token": token,
      uid: uid,
      "client": client
      
    },
  });

  service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // config.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;  
    return config;
  });

  service.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => Promise.reject(error),
  );

  type RequestProps = {
    url: string;
    payload?: object;
  };

  type HttpMethodType = 'get' | 'post' | 'patch' | 'put' | 'delete';

  const methodHandler = async (
    method: HttpMethodType,
    { url, payload }: RequestProps,
  ): Promise<AxiosResponse> => {
    return await service[method](url, payload);
  };

  return {
    get: async (url: string) => await methodHandler('get', { url }),
    post: async (data: RequestProps) => await methodHandler('post', data),
    patch: async (data: RequestProps) => await methodHandler('patch', data),
    put: async (data: RequestProps) => await methodHandler('put', data),

    // passing payload to DELETE works differently
    delete: async (url: string) => await methodHandler('delete', { url }),
  };
};

export const axiosRequest = services();
