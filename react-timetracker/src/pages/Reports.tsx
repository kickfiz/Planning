import { useState, useEffect } from 'react';
import { timeEntriesApi, categoriesApi } from '../api';
import type { MonthlyStats, ChartDataPoint, CategoryDistribution } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Reports() {
  usePageTitle('Reports');
  const [isLoading, setIsLoading] = useState(true);
  const [showAnnualView, setShowAnnualView] = useState(true);
  const [currentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // KPI data
  const [stats, setStats] = useState<MonthlyStats>({ TotalHours: 0, TasksCompleted: 0, AverageDailyHours: 0 });

  // Chart data
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [maxChartValue, setMaxChartValue] = useState(200);
  const [categoryData, setCategoryData] = useState<CategoryDistribution[]>([]);

  useEffect(() => {
    loadReportData();
  }, [showAnnualView, currentYear]);

  const loadReportData = async () => {
    try {
      // Load KPI statistics for current month
      const statsResponse = await timeEntriesApi.getStatistics(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1
      );
      setStats(statsResponse.data);

      // Load chart data based on view mode
      await loadChartData();
      await loadCategoryData();
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      let data: ChartDataPoint[] = [];

      if (showAnnualView) {
        // Load annual data (12 months)
        const response = await timeEntriesApi.getAnnualHours(currentYear);
        console.log('Annual data response:', response.data);
        data = response.data;
      } else {
        // Load monthly data (only days with data)
        const response = await timeEntriesApi.getMonthlyHours(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1
        );
        console.log('Monthly data response:', response.data);
        data = response.data;
      }

      console.log('Processed chart data:', data);
      setChartData(data);

      // Calculate max value for Y-axis using the new data
      if (data.length > 0) {
        const maxValue = Math.max(...data.map((d) => d.Hours));
        setMaxChartValue(Math.ceil(maxValue / 10) * 10 || 10);
      } else {
        setMaxChartValue(10); // Default scale for empty charts
      }
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  };

  const loadCategoryData = async () => {
    try {
      const month = showAnnualView ? undefined : currentMonth.getMonth() + 1;
      const year = showAnnualView ? currentYear : currentMonth.getFullYear();

      const response = await categoriesApi.getDistribution(month, year);
      setCategoryData(response.data);
    } catch (error) {
      console.error('Failed to load category data:', error);
    }
  };

  const buildConicGradient = () => {
    if (categoryData.length === 0) return 'conic-gradient(from 0deg, #374151 0deg 360deg)';

    const totalHours = categoryData.reduce((sum, c) => sum + c.Hours, 0);
    const gradientParts: string[] = [];
    let currentAngle = 0;

    categoryData.forEach((category) => {
      const percentage = category.Hours / totalHours;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      gradientParts.push(`${category.Color} ${startAngle}deg ${endAngle}deg`);
      currentAngle = endAngle;
    });

    return `conic-gradient(from 0deg, ${gradientParts.join(', ')})`;
  };

  const getChartLabel = (data: ChartDataPoint): string => {
    if (showAnnualView) {
      return data.MonthName || '';
    } else {
      return String(data.Day || '');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reports Overview</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : (
          <>
            {/* Monthly Performance Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Monthly Performance Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Hours Logged */}
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-400 text-sm">Total Hours Logged</span>
                    <span className="text-green-400">⏱</span>
                  </div>
                  <div className="text-3xl font-bold">{stats.TotalHours} hours</div>
                </div>

                {/* Tasks Completed */}
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-400 text-sm">Tasks Completed</span>
                    <span className="text-blue-400">☰</span>
                  </div>
                  <div className="text-3xl font-bold">{stats.TasksCompleted} tasks</div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Analytics</h2>
                <div className="flex gap-3">
                  {/* Year Selector */}
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    className="bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                  </select>

                  {/* View Toggle */}
                  <div className="flex gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800">
                    <button
                      onClick={() => setShowAnnualView(false)}
                      className={`px-4 py-2 rounded ${
                        !showAnnualView
                          ? 'bg-green-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      } transition-colors`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setShowAnnualView(true)}
                      className={`px-4 py-2 rounded ${
                        showAnnualView
                          ? 'bg-green-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      } transition-colors`}
                    >
                      Annual
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hours Chart */}
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <h3 className="text-lg font-semibold mb-2">
                    {showAnnualView
                      ? 'Monthly Hours Logged'
                      : `Daily Hours - ${currentMonth.toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}`}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    {showAnnualView
                      ? 'Total hours tracked over the year.'
                      : 'Hours logged each day this month.'}
                  </p>

                  {chartData.length > 0 ? (
                    <div className="relative h-64">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                        <span>{maxChartValue}</span>
                        <span>{maxChartValue * 0.75}</span>
                        <span>{maxChartValue * 0.5}</span>
                        <span>{maxChartValue * 0.25}</span>
                        <span>0</span>
                      </div>

                      {/* Chart area */}
                      <div className="ml-8 h-full flex items-end justify-between gap-1">
                        {chartData.map((data, index) => {
                          const height = maxChartValue > 0 ? (data.Hours / maxChartValue) * 100 : 0;

                          return (
                            <div key={index} className="flex-1 flex items-end justify-center h-full">
                              {data.Hours > 0 && (
                                <div
                                  className="w-full bg-blue-600 rounded-t hover:bg-blue-500 transition-colors"
                                  style={{ height: `${height}%` }}
                                  title={`${getChartLabel(data)}: ${data.Hours} hours`}
                                ></div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* X-axis labels */}
                      <div className="ml-8 mt-2 flex justify-between text-xs text-gray-500">
                        {chartData.map((data, index) => (
                          <span key={index} className="flex-1 text-center">
                            {getChartLabel(data)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <p>No data available for this period</p>
                    </div>
                  )}

                  <div className="mt-8 pt-4 border-t border-gray-800 flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 bg-blue-600 rounded"></span>
                    <span className="text-gray-400">Hours Logged</span>
                  </div>
                </div>

                {/* Time Distribution by Category */}
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <h3 className="text-lg font-semibold mb-2">Time Distribution by Category</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Breakdown of hours spent across different project categories.
                  </p>

                  {categoryData.length > 0 ? (
                    <>
                      {/* Pie Chart (Simulated with CSS) */}
                      <div className="flex items-center justify-center mb-6">
                        <div className="relative w-48 h-48">
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{ background: buildConicGradient() }}
                          ></div>
                          <div className="absolute inset-8 rounded-full bg-gray-900"></div>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="space-y-2">
                        {categoryData.map((category, index) => {
                          const totalHours = categoryData.reduce((sum, c) => sum + c.Hours, 0);
                          const percentage = (category.Hours / totalHours) * 100;

                          return (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.Color }}
                                ></span>
                                <span className="text-gray-300">{category.CategoryName}</span>
                              </div>
                              <span className="text-gray-400">
                                {category.Hours.toFixed(1)}h ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <p>No category data available for this period</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
