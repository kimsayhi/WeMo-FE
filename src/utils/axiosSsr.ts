import { API_PATHS } from '@/constants/apiPath';
import axios from 'axios';

export const ssrInstance = (cookie?: string) => {
  const headers = cookie ? { Cookie: cookie } : {};
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    withCredentials: true,
    headers: headers,
  });

  let isRefreshing = false;
  let refreshSubscribers: ((newCookie: string) => void)[] = [];

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && originalRequest) {
        if (isRefreshing) {
          // 이미 리프레시 진행 중이면 새 토큰을 받을 때까지 대기
          return new Promise((resolve) => {
            refreshSubscribers.push((newCookie) => {
              originalRequest.headers = {
                ...originalRequest.headers,
                Cookie: newCookie,
              };
              resolve(instance(originalRequest)); // 재요청
            });
          });
        }

        if (error.response?.status === 401) {
          try {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_BASE_URL}${API_PATHS.AUTH.REFRESH_TOKEN}`,
              {},
              { headers: headers, withCredentials: true },
            );
            const newCookie = response.headers['set-cookie'];
            if (!newCookie) throw new Error('새 쿠키를 받지 못함');

            const updatedCookie = Array.isArray(newCookie)
              ? newCookie.join('; ')
              : newCookie;

            refreshSubscribers.forEach((callback) => callback(updatedCookie));
            refreshSubscribers = [];
            originalRequest.headers = {
              ...originalRequest.headers,
              Cookie: updatedCookie,
            };
            return instance(originalRequest);
          } catch (error) {
            console.log('토큰 재발급 실패', error);
          } finally {
            isRefreshing = false;
          }
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
};
