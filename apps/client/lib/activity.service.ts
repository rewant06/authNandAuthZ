import api from "./api";
import { PaginatedResponse, ActivityLog } from "@/types/index";

export const getActivityLogs = async (page = 1, limit = 20) => {
  const { data } = await api.get<PaginatedResponse<ActivityLog>>(
    `/activity-log?/page=${page}&limit=${limit}`
  );
  return data;
};
