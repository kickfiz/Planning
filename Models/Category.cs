using System.ComponentModel.DataAnnotations;

namespace Planning.Models;

public class Category
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Category name is required")]
    [StringLength(100, ErrorMessage = "Category name cannot exceed 100 characters")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(7, MinimumLength = 7, ErrorMessage = "Color must be in hex format (e.g., #10b981)")]
    public string Color { get; set; } = "#10b981"; // Default green color

    public bool IsArchived { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();
}
