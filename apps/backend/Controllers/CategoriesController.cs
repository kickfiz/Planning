using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimeTracker.API.Data;
using TimeTracker.API.Models;

namespace TimeTracker.API.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly TimeTrackerDbContext _context;

    public CategoriesController(TimeTrackerDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetAll()
    {
        return await _context.Categories
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Category>> GetById(int id)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category == null)
            return NotFound();

        return category;
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<Category>>> GetActive()
    {
        return await _context.Categories
            .Where(c => !c.IsArchived)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Category>> Create(Category category)
    {
        category.CreatedAt = DateTime.UtcNow;
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Category category)
    {
        if (id != category.Id)
            return BadRequest();

        _context.Entry(category).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await CategoryExists(id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return NotFound();

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/archive")]
    public async Task<IActionResult> Archive(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return NotFound();

        category.IsArchived = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/unarchive")]
    public async Task<IActionResult> Unarchive(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return NotFound();

        category.IsArchived = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("distribution")]
    public async Task<ActionResult<IEnumerable<object>>> GetDistribution([FromQuery] int? month, [FromQuery] int? year)
    {
        var query = _context.TimeEntries.Include(t => t.Category).AsQueryable();

        if (year.HasValue && month.HasValue)
        {
            var startDate = new DateTime(year.Value, month.Value, 1).ToString("yyyy-MM-dd");
            var endDate = new DateTime(year.Value, month.Value, DateTime.DaysInMonth(year.Value, month.Value)).ToString("yyyy-MM-dd");
            query = query.Where(t => string.Compare(t.Date, startDate) >= 0 && string.Compare(t.Date, endDate) <= 0);
        }

        var distribution = await query
            .GroupBy(t => new { t.CategoryId, t.Category!.Name, t.Category.Color })
            .Select(g => new
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                Color = g.Key.Color,
                Hours = g.Sum(t => t.Hours),
                Percentage = 0.0 // Will calculate after
            })
            .ToListAsync();

        var totalHours = distribution.Sum(d => d.Hours);
        var result = distribution.Select(d => new
        {
            d.CategoryId,
            d.CategoryName,
            d.Color,
            d.Hours,
            Percentage = totalHours > 0 ? (d.Hours / totalHours) * 100 : 0
        });

        return Ok(result);
    }

    private async Task<bool> CategoryExists(int id)
    {
        return await _context.Categories.AnyAsync(e => e.Id == id);
    }
}
