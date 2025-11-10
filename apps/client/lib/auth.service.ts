import api from "./api";

import {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RefreshResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  User,
} from "@iam-project/types";

export const registerUser = (data: RegisterPayload) => {
  return api.post<void>("/auth/register", data);
};

export const loginUser = async (credentials: LoginPayload) => {
  const { data } = await api.post<LoginResponse>("/auth/login", credentials);
  return data;
};

export const requestPasswordReset = (data: ForgotPasswordPayload) => {
  return api.post<void>("/auth/forgot-password", data);
};

export const resetPassword = (data: ResetPasswordPayload) => {
  return api.post<void>("/auth/reset-password", data);
};

export const refreshAccessToken = async () => {
  const { data } = await api.post<RefreshResponse>("/auth/refresh");
  return data;
};

export const getSelf = async () => {
  const { data } = await api.get<User>("/auth/me");
  return data;
};
