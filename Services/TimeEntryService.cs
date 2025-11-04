using Microsoft.EntityFrameworkCore;
using Planning.Data;
using Planning.Models;

namespace Planning.Services;

public class TimeEntryService : ITimeEntryService
{
    private readonly TimeTrackerDbContext _context;

    public TimeEntryService(TimeTrackerDbContext context)
    {
        _context = context;
    }

    public async Task<List<TimeEntry>> GetAllEntriesAsync()
    {
        return await _context.TimeEntries
            .Include(e => e.Category)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
    }

    public async Task<List<TimeEntry>> GetEntriesByMonthYearAsync(int month, int year)
    {
        return await _context.TimeEntries
            .Include(e => e.Category)
            .Where(e => e.Date.Month == month && e.Date.Year == year)
            .OrderBy(e => e.Date)
            .ToListAsync();
    }

    public async Task<TimeEntry?> GetEntryByIdAsync(int id)
    {
        return await _context.TimeEntries
            .Include(e => e.Category)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<TimeEntry> CreateEntryAsync(TimeEntry entry)
    {
        _context.TimeEntries.Add(entry);
        await _context.SaveChangesAsync();
        return entry;
    }

    public async Task UpdateEntryAsync(TimeEntry entry)
    {
        _context.TimeEntries.Update(entry);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteEntryAsync(int id)
    {
        var entry = await _context.TimeEntries.FindAsync(id);
        if (entry != null)
        {
            _context.TimeEntries.Remove(entry);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<Dictionary<string, decimal>> GetMonthlyStatisticsAsync(int month, int year)
    {
        var entries = await GetEntriesByMonthYearAsync(month, year);

        var stats = new Dictionary<string, decimal>
        {
            ["TotalHours"] = entries.Sum(e => e.Hours),
            ["TasksCompleted"] = entries.Count,
            ["AverageDailyHours"] = entries.Any() ? entries.Average(e => e.Hours) : 0
        };

        return stats;
    }

    public async Task<List<(int Month, string MonthName, decimal Hours)>> GetAnnualHoursAsync(int year)
    {
        var monthNames = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
        var result = new List<(int Month, string MonthName, decimal Hours)>();

        for (int month = 1; month <= 12; month++)
        {
            var hours = await _context.TimeEntries
                .Where(e => e.Date.Month == month && e.Date.Year == year)
                .SumAsync(e => (decimal?)e.Hours) ?? 0;

            result.Add((month, monthNames[month - 1], hours));
        }

        return result;
    }

    public async Task<List<(int Day, decimal Hours)>> GetMonthlyHoursByDayAsync(int month, int year)
    {
        var entries = await _context.TimeEntries
            .Where(e => e.Date.Month == month && e.Date.Year == year)
            .GroupBy(e => e.Date.Day)
            .Select(g => new { Day = g.Key, Hours = g.Sum(e => e.Hours) })
            .ToListAsync();

        return entries.Select(e => (e.Day, e.Hours)).ToList();
    }
}
