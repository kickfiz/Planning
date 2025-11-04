using Planning.Models;

namespace Planning.Services;

public interface ITimeEntryService
{
    Task<List<TimeEntry>> GetAllEntriesAsync();
    Task<List<TimeEntry>> GetEntriesByMonthYearAsync(int month, int year);
    Task<TimeEntry?> GetEntryByIdAsync(int id);
    Task<TimeEntry> CreateEntryAsync(TimeEntry entry);
    Task UpdateEntryAsync(TimeEntry entry);
    Task DeleteEntryAsync(int id);
    Task<Dictionary<string, decimal>> GetMonthlyStatisticsAsync(int month, int year);
    Task<List<(int Month, string MonthName, decimal Hours)>> GetAnnualHoursAsync(int year);
    Task<List<(int Day, decimal Hours)>> GetMonthlyHoursByDayAsync(int month, int year);
}
