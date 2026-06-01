import http from "./http";
import config from "./config";

const host = config.API_URL;

export interface NotificationLog {
  _id: any;
  userId: string;
  channel?: string;
  title?: string;
  message?: string;
  sentAt: string;
  targetId?: string;
  type?: string;
  period?: string;
}

export interface BatchReport {
  id: any;
  jobName: string;
  startTime: number;
  endTime: number;
  status: string;
  durationMs: number;
  errorMessage?: string;
  metadata?: any;
}

const adminService = {
  triggerMonthlyPerformance: async () => {
    return http.post(`${host}/auth/admin/batches/trigger/monthly-performance`, {});
  },
  triggerStockVariation: async () => {
    return http.post(`${host}/auth/admin/batches/trigger/stock-variation`, {});
  },
  triggerPeriodicDaily: async () => {
    return http.post(`${host}/auth/admin/batches/trigger/periodic-daily`, {});
  },
  triggerPeriodicWeekly: async () => {
    return http.post(`${host}/auth/admin/batches/trigger/periodic-weekly`, {});
  },
  triggerPeriodicMonthly: async () => {
    return http.post(`${host}/auth/admin/batches/trigger/periodic-monthly`, {});
  },
  getLogs: async (): Promise<NotificationLog[]> => {
    return http.get(`${host}/auth/admin/batches/logs`) as Promise<NotificationLog[]>;
  },
  getHistory: async (): Promise<NotificationLog[]> => {
    return http.get(`${host}/auth/admin/batches/history`) as Promise<NotificationLog[]>;
  },
  getReports: async (page = 0, size = 20, jobName?: string, status?: string, sortBy = "startTime", direction = "DESC"): Promise<{ content: BatchReport[]; totalElements: number }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      direction,
    });
    if (jobName) params.append("jobName", jobName);
    if (status) params.append("status", status);
    
    return http.get(`${host}/auth/admin/batches/reports?${params.toString()}`) as Promise<{ content: BatchReport[]; totalElements: number }>;
  },
};

export default adminService;
