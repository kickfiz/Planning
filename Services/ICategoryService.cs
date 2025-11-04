using Planning.Models;

namespace Planning.Services;

public interface ICategoryService
{
    Task<List<Category>> GetAllCategoriesAsync();
    Task<List<Category>> GetActiveCategoriesAsync();
    Task<Category?> GetCategoryByIdAsync(int id);
    Task<Category> CreateCategoryAsync(Category category);
    Task<Category> UpdateCategoryAsync(Category category);
    Task<bool> DeleteCategoryAsync(int id);
    Task<bool> ArchiveCategoryAsync(int id);
    Task<bool> UnarchiveCategoryAsync(int id);
    Task<Dictionary<string, decimal>> GetCategoryDistributionAsync(int? month = null, int? year = null);
    Task<List<(string CategoryName, string Color, decimal Hours)>> GetCategoryDistributionWithColorsAsync(int? month = null, int? year = null);
}
