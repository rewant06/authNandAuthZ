import api from "./api";
import {
  UpdateProfilePayload,
  User,
  PaginatedResponse,
} from "@iam-project/types";

export const updateSelf = async (payload: UpdateProfilePayload) => {
  const { data } = await api.patch<{ user: User }>("/users/me", payload);
  return data.user;
};

// ----- Admin Only ---

export const getAllUsers = async (page = 1, limit = 10) => {
  const { data } = await api.get<PaginatedResponse<User>>(
    `/users?page=${page}&limit=${limit}`
  );
  return data;
};
