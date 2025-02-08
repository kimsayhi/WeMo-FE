import { API_PATHS } from '@/constants/apiPath';
import {
  CreatePlanRequestBody,
  CreatePlanResponse,
  PlanDetailResponse,
} from '@/types/api/plan';
import instance from './axiosInstance';
import { ApiResponse } from '@/types/api/apiResponse';
import { showToast } from '@/utils/showToast';
import TOAST_MESSAGE from '@/constants/toastMessage';
import axios from 'axios';
import { AxiosRequestConfig } from 'axios';
import { ssrInstance } from '@/utils/axiosSsr';

interface PostPlanParams {
  meetingId: number;
  requestBody: CreatePlanRequestBody;
}

export const createPlan = async ({
  meetingId,
  requestBody,
}: PostPlanParams) => {
  try {
    const response = await instance.post<CreatePlanResponse>(
      API_PATHS.PLAN.CREATE(meetingId),
      requestBody,
    );
    if (!response.data.success) {
      throw new Error('실패');
    }
    showToast('success', TOAST_MESSAGE.CREATE_PLAN);
    return response.data;
  } catch {
    showToast('error', TOAST_MESSAGE.CREATE_PLAN_ERROR);
  }
};

export const fetchPlanDetail = async (planId: number, cookie?: string) => {
  if (isNaN(planId)) return;
  const config: AxiosRequestConfig = cookie
    ? { headers: { Cookie: cookie }, withCredentials: true }
    : {};
  const response = await instance<PlanDetailResponse>(
    API_PATHS.PLAN.GET_DETAIL(planId),
    config,
  );
  return response.data;
};

// export const reissueSSR = async (cookie: string) => {
//   const sinstance = ssrInstance(cookie)
//   try {
//     const response = await ssrInstance.post(
//       API_PATHS.AUTH.REFRESH_TOKEN,
//       {},
//       {
//         headers: { Cookie: cookie },
//       },
//     );
//     const newCookie = response.headers['set-cookie'];
//     if (!newCookie) return;
//     return Array.isArray(newCookie) ? newCookie.join('; ') : newCookie;
//   } catch (error) {
//     console.log('리이슈 에러', error);
//   }
// };

export const fetchPlanDetailSSR = async (planId: number, cookie?: string) => {
  const newInstance = ssrInstance(cookie);
  if (isNaN(planId)) return;

  try {
    const response = await newInstance<PlanDetailResponse>(
      API_PATHS.PLAN.GET_DETAIL(planId),
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.status;
    }
    throw error;
  }
};

export const attendPlan = async (planId: number) => {
  try {
    if (isNaN(planId)) return;
    const response = await instance.post<ApiResponse>(
      API_PATHS.PLAN.ATTEND(planId),
    );
    if (!response.data.success) {
      throw new Error('실패');
    }
    showToast('success', TOAST_MESSAGE.ATTEND_PLAN);
    return response.data.success;
  } catch {
    showToast('error', TOAST_MESSAGE.ATTEND_PLAN_ERROR);
    return false;
  }
};

export const leavePlan = async (planId: number) => {
  try {
    if (isNaN(planId)) return;
    const response = await instance.delete<ApiResponse>(
      API_PATHS.PLAN.ATTEND(planId),
    );
    if (!response.data.success) {
      throw new Error('실패');
    }
    showToast('success', TOAST_MESSAGE.LEAVE_PLAN);
    return response.data.success;
  } catch {
    showToast('error', TOAST_MESSAGE.LEAVE_PLAN_ERROR);
    return false;
  }
};

export const likePlan = async (planId: number) => {
  try {
    if (isNaN(planId)) return;
    const response = await instance.post<ApiResponse>(
      API_PATHS.PLAN.LIKE(planId),
    );
    if (!response.data.success) {
      throw new Error('실패');
    }
    showToast('success', TOAST_MESSAGE.ADD_LIKE);
    return response.data.success;
  } catch {
    showToast('error', TOAST_MESSAGE.ADD_LIKE_ERROR);
    return false;
  }
};

export const unLikePlan = async (planId: number) => {
  try {
    if (isNaN(planId)) return;
    const response = await instance.delete<ApiResponse>(
      API_PATHS.PLAN.LIKE(planId),
    );
    if (!response.data.success) {
      throw new Error('실패');
    }
    showToast('success', TOAST_MESSAGE.REMOVE_LIKE);
    return response.data.success;
  } catch {
    showToast('error', TOAST_MESSAGE.REMOVE_LIKE_ERROR);
    return false;
  }
};
