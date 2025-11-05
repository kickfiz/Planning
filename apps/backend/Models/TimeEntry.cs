namespace TimeTracker.API.Models;

public class TimeEntry
{
    public int Id { get; set; }
    public string Date { get; set; } = string.Empty; // Using string for compatibility with existing DB
    public double Hours { get; set; }
    public string Description { get; set; } = string.Empty;
    public int? CategoryId { get; set; }

    // Navigation property
    public Category? Category { get; set; }
}
