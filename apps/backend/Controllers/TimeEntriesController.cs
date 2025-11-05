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

    private async Task<bool> EntryExists(int id)
    {
        return await _context.TimeEntries.AnyAsync(e => e.Id == id);
    }
}
