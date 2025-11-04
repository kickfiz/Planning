using System.ComponentModel.DataAnnotations;

namespace Planning.Models;

public class TimeEntry
{
    public int Id { get; set; }

    [Required]
    public DateTime Date { get; set; } = DateTime.Today;

    [Required]
    [Range(0.1, 24.0, ErrorMessage = "Hours must be between 0.1 and 24")]
    public decimal Hours { get; set; }

    [Required(ErrorMessage = "Task description is required")]
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string Description { get; set; } = string.Empty;

    public int? CategoryId { get; set; }

    // Navigation property
    public Category? Category { get; set; }
}
