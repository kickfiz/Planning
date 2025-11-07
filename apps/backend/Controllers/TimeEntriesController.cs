using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimeTracker.API.Data;
using TimeTracker.API.Models;

namespace TimeTracker.API.Controllers;

[ApiController]
[Route("api/time-entries")]
public class TimeEntriesController : ControllerBase
{
    private readonly TimeTrackerDbContext _context;

    public TimeEntriesController(TimeTrackerDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TimeEntry>>> GetAll()
    {
        return await _context.TimeEntries
            .Include(t => t.Category)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    [HttpGet("month/{year}/{month}")]
    public async Task<ActionResult<IEnumerable<TimeEntry>>> GetByMonth(int year, int month)
    {
        var startDate = new DateTime(year, month, 1).ToString("yyyy-MM-dd");
        var endDate = new DateTime(year, month, DateTime.DaysInMonth(year, month)).ToString("yyyy-MM-dd");

        return await _context.TimeEntries
            .Include(t => t.Category)
            .Where(t => string.Compare(t.Date, startDate) >= 0 && string.Compare(t.Date, endDate) <= 0)
            .OrderBy(t => t.Date)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TimeEntry>> GetById(int id)
    {
        var entry = await _context.TimeEntries
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (entry == null)
            return NotFound();

        return entry;
    }

    [HttpPost]
    public async Task<ActionResult<TimeEntry>> Create(TimeEntry entry)
    {
        _context.TimeEntries.Add(entry);
        await _context.SaveChangesAsync();

        // Load category after saving
        await _context.Entry(entry).Reference(t => t.Category).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = entry.Id }, entry);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, TimeEntry entry)
    {
        if (id != entry.Id)
            return BadRequest();

        _context.Entry(entry).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await EntryExists(id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entry = await _context.TimeEntries.FindAsync(id);
        if (entry == null)
            return NotFound();

        _context.TimeEntries.Remove(entry);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("statistics/{year}/{month}")]
    public async Task<ActionResult<object>> GetStatistics(int year, int month)
    {
        var startDate = new DateTime(year, month, 1).ToString("yyyy-MM-dd");
        var endDate = new DateTime(year, month, DateTime.DaysInMonth(year, month)).ToString("yyyy-MM-dd");

        var entries = await _context.TimeEntries
            .Where(t => string.Compare(t.Date, startDate) >= 0 && string.Compare(t.Date, endDate) <= 0)
            .ToListAsync();

        var totalHours = entries.Sum(e => e.Hours);
        var workingDays = entries.Select(e => e.Date).Distinct().Count();
        var averagePerDay = workingDays > 0 ? totalHours / workingDays : 0;

        return Ok(new
        {
            TotalHours = totalHours,
            WorkingDays = workingDays,
            AveragePerDay = averagePerDay
        });
    }

    [HttpGet("annual/{year}")]
    public async Task<ActionResult<IEnumerable<object>>> GetAnnualHours(int year)
    {
        var startDate = new DateTime(year, 1, 1).ToString("yyyy-MM-dd");
        var endDate = new DateTime(year, 12, 31).ToString("yyyy-MM-dd");

        var entries = await _context.TimeEntries
            .Include(t => t.Category)
            .Where(t => string.Compare(t.Date, startDate) >= 0 && string.Compare(t.Date, endDate) <= 0)
            .ToListAsync();

        var monthlyData = entries
            .GroupBy(e => DateTime.Parse(e.Date).Month)
            .Select(g => new
            {
                Month = g.Key,
                Hours = g.Sum(e => e.Hours),
                Categories = g.GroupBy(e => e.Category)
                    .Select(cg => new
                    {
                        CategoryName = cg.Key?.Name ?? "Uncategorized",
                        Color = cg.Key?.Color ?? "#6B7280",
                        Hours = cg.Sum(e => e.Hours)
                    })
                    .OrderByDescending(c => c.Hours)
                    .ToList()
            })
            .OrderBy(x => x.Month)
            .ToList();

        // Fill in missing months with 0 hours
        var result = Enumerable.Range(1, 12).Select(month =>
        {
            var data = monthlyData.FirstOrDefault(m => m.Month == month);
            return new
            {
                Month = new DateTime(year, month, 1).ToString("MMM"),
                Hours = data?.Hours ?? 0,
                Categories = (object)(data?.Categories ?? Enumerable.Empty<object>())
            };
        });

        return Ok(result);
    }

    [HttpGet("monthly/{year}/{month}")]
    public async Task<ActionResult<IEnumerable<object>>> GetMonthlyHours(int year, int month)
    {
        var startDate = new DateTime(year, month, 1).ToString("yyyy-MM-dd");
        var daysInMonth = DateTime.DaysInMonth(year, month);
        var endDate = new DateTime(year, month, daysInMonth).ToString("yyyy-MM-dd");

        var entries = await _context.TimeEntries
            .Include(t => t.Category)
            .Where(t => string.Compare(t.Date, startDate) >= 0 && string.Compare(t.Date, endDate) <= 0)
            .ToListAsync();

        var dailyData = entries
            .GroupBy(e => e.Date)
            .Select(g => new
            {
                Date = g.Key,
                Day = DateTime.Parse(g.Key).Day,
                Hours = g.Sum(e => e.Hours),
                Categories = g.GroupBy(e => e.Category)
                    .Select(cg => new
                    {
                        CategoryName = cg.Key?.Name ?? "Uncategorized",
                        Color = cg.Key?.Color ?? "#6B7280",
                        Hours = cg.Sum(e => e.Hours)
                    })
                    .OrderByDescending(c => c.Hours)
                    .ToList()
            })
            .OrderBy(x => x.Day)
            .ToList();

        // Fill in missing days with 0 hours
        var result = Enumerable.Range(1, daysInMonth).Select(day =>
        {
            var data = dailyData.FirstOrDefault(d => d.Day == day);
            return new
            {
                Day = day.ToString(),
                Hours = data?.Hours ?? 0,
                Categories = (object)(data?.Categories ?? Enumerable.Empty<object>())
            };
        });

        return Ok(result);
    }

    private async Task<bool> EntryExists(int id)
    {
        return await _context.TimeEntries.AnyAsync(e => e.Id == id);
    }
}
