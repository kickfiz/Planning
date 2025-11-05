import axios from 'axios';
import type { TimeEntry, Category, MonthlyStats, ChartDataPoint, CategoryDistribution } from './types';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Time Entries API
export const timeEntriesApi = {
  getByMonth: (year: number, month: number) =>
    api.get<TimeEntry[]>(`/time-entries/month/${year}/${month}`),

  create: (entry: TimeEntry) =>
    api.post<TimeEntry>('/time-entries', entry),

  update: (id: number, entry: TimeEntry) =>
    api.put<TimeEntry>(`/time-entries/${id}`, entry),

  delete: (id: number) =>
    api.delete(`/time-entries/${id}`),

  getStatistics: (year: number, month: number) =>
    api.get<MonthlyStats>(`/time-entries/statistics/${year}/${month}`),

  getAnnualHours: (year: number) =>
    api.get<ChartDataPoint[]>(`/time-entries/annual/${year}`),

  getMonthlyHours: (year: number, month: number) =>
    api.get<ChartDataPoint[]>(`/time-entries/monthly/${year}/${month}`),
};

// Categories API
export const categoriesApi = {
  getAll: () =>
    api.get<Category[]>('/categories'),

  getActive: () =>
    api.get<Category[]>('/categories/active'),

  create: (category: Category) =>
    api.post<Category>('/categories', category),

  update: (id: number, category: Category) =>
    api.put<Category>(`/categories/${id}`, category),

  archive: (id: number) =>
    api.post(`/categories/${id}/archive`),

  unarchive: (id: number) =>
    api.post(`/categories/${id}/unarchive`),

  delete: (id: number) =>
    api.delete(`/categories/${id}`),

  getDistribution: (month?: number, year?: number) =>
    api.get<CategoryDistribution[]>('/categories/distribution', {
      params: { month, year }
    }),
};
