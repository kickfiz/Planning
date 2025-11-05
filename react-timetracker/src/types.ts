export interface TimeEntry {
  Id?: number;
  Date: string;
  Hours: number;
  Description: string;
  CategoryId?: number | null;
  Category?: Category | null;
}

export interface Category {
  Id?: number;
  Name: string;
  Color: string;
  IsArchived?: boolean;
  CreatedAt?: string;
}

export interface MonthlyStats {
  TotalHours: number;
  TasksCompleted: number;
  AverageDailyHours: number;
}

export interface ChartDataPoint {
  Day?: number;
  MonthName?: string;
  Hours: number;
}

export interface CategoryDistribution {
  CategoryName: string;
  Color: string;
  Hours: number;
}
