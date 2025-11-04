using Microsoft.EntityFrameworkCore;
using Planning.Data;
using Planning.Models;

namespace Planning.Services;

public class CategoryService : ICategoryService
{
    private readonly TimeTrackerDbContext _context;

    public CategoryService(TimeTrackerDbContext context)
    {
        _context = context;
    }

    public async Task<List<Category>> GetAllCategoriesAsync()
    {
        return await _context.Categories
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<List<Category>> GetActiveCategoriesAsync()
    {
        return await _context.Categories
            .Where(c => !c.IsArchived)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Category?> GetCategoryByIdAsync(int id)
    {
        return await _context.Categories.FindAsync(id);
    }

    public async Task<Category> CreateCategoryAsync(Category category)
    {
        category.CreatedAt = DateTime.UtcNow;
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<Category> UpdateCategoryAsync(Category category)
    {
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return false;

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ArchiveCategoryAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return false;

        category.IsArchived = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnarchiveCategoryAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return false;

        category.IsArchived = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Dictionary<string, decimal>> GetCategoryDistributionAsync(int? month = null, int? year = null)
    {
        var query = _context.TimeEntries
            .Include(e => e.Category)
            .Where(e => e.CategoryId != null);

        if (month.HasValue && year.HasValue)
        {
            query = query.Where(e => e.Date.Month == month.Value && e.Date.Year == year.Value);
        }
        else if (year.HasValue)
        {
            query = query.Where(e => e.Date.Year == year.Value);
        }

        var categoryHours = await query
            .GroupBy(e => e.Category!.Name)
            .Select(g => new { Category = g.Key, Hours = g.Sum(e => e.Hours) })
            .ToDictionaryAsync(x => x.Category, x => x.Hours);

        return categoryHours;
    }

    public async Task<List<(string CategoryName, string Color, decimal Hours)>> GetCategoryDistributionWithColorsAsync(int? month = null, int? year = null)
    {
        var query = _context.TimeEntries
            .Include(e => e.Category)
            .Where(e => e.CategoryId != null);

        if (month.HasValue && year.HasValue)
        {
            query = query.Where(e => e.Date.Month == month.Value && e.Date.Year == year.Value);
        }
        else if (year.HasValue)
        {
            query = query.Where(e => e.Date.Year == year.Value);
        }

        var categoryData = await query
            .GroupBy(e => new { e.Category!.Name, e.Category.Color })
            .Select(g => new { g.Key.Name, g.Key.Color, Hours = g.Sum(e => e.Hours) })
            .ToListAsync();

        return categoryData.Select(c => (c.Name, c.Color, c.Hours)).ToList();
    }
}
