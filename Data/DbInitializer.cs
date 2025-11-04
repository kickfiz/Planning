using Planning.Models;

namespace Planning.Data;

public static class DbInitializer
{
    public static void Initialize(TimeTrackerDbContext context)
    {
        context.Database.EnsureCreated();

        // Seed categories if not already present
        if (!context.Categories.Any())
        {
            var categories = new Category[]
            {
                new Category { Name = "Development", Color = "#3B82F6", IsArchived = false },
                new Category { Name = "Meetings", Color = "#10B981", IsArchived = false },
                new Category { Name = "Research", Color = "#F59E0B", IsArchived = false },
                new Category { Name = "Admin", Color = "#A855F7", IsArchived = false },
                new Category { Name = "Learning", Color = "#EC4899", IsArchived = false }
            };

            context.Categories.AddRange(categories);
            context.SaveChanges();
        }

        // Check if database is already seeded
        if (context.TimeEntries.Any())
        {
            return;
        }

        // Get categories for assignment
        var development = context.Categories.First(c => c.Name == "Development");
        var meetings = context.Categories.First(c => c.Name == "Meetings");
        var admin = context.Categories.First(c => c.Name == "Admin");

        var entries = new TimeEntry[]
        {
            new TimeEntry
            {
                Date = new DateTime(2024, 3, 1),
                Hours = 8.0m,
                Description = "Completed initial design mockups for project Alpha. Researched competitor UIs and created wireframes for user flows.",
                CategoryId = development.Id
            },
            new TimeEntry
            {
                Date = new DateTime(2024, 3, 2),
                Hours = 7.5m,
                Description = "Developed frontend components for user authentication. Implemented login and registration forms using React and shadcn/ui framework.",
                CategoryId = development.Id
            },
            new TimeEntry
            {
                Date = new DateTime(2024, 3, 3),
                Hours = 6.0m,
                Description = "Attended team stand-up and planning meeting. Reviewed sprint backlog and assigned new tasks for the upcoming week. Provided feedback on feature specifications.",
                CategoryId = meetings.Id
            },
            new TimeEntry
            {
                Date = new DateTime(2024, 3, 4),
                Hours = 9.0m,
                Description = "Bug fixing and refactoring for existing analytics module. Optimized database queries and improved API response times. Wrote comprehensive unit tests for new features.",
                CategoryId = development.Id
            },
            new TimeEntry
            {
                Date = new DateTime(2024, 3, 5),
                Hours = 7.0m,
                Description = "Prepared presentation for client demo. Created detailed slides, gathered performance metrics, and rehearsed key talking points with the team. Collaborated with marketing team on collateral.",
                CategoryId = admin.Id
            },
            new TimeEntry
            {
                Date = new DateTime(2024, 3, 6),
                Hours = 8.0m,
                Description = "Integrated new payment gateway system. Configured webhooks and tested transaction flows end-to-end. Documented integration steps for future reference.",
                CategoryId = development.Id
            },
            new TimeEntry
            {
                Date = new DateTime(2024, 3, 7),
                Hours = 7.0m,
                Description = "Conducted user acceptance testing (UAT) for the latest release. Collected feedback from test users and reported identified bugs to the development team.",
                CategoryId = admin.Id
            }
        };

        context.TimeEntries.AddRange(entries);
        context.SaveChanges();
    }
}
