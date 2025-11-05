using Microsoft.EntityFrameworkCore;
using TimeTracker.API.Models;

namespace TimeTracker.API.Data;

public class TimeTrackerDbContext : DbContext
{
    public TimeTrackerDbContext(DbContextOptions<TimeTrackerDbContext> options)
        : base(options)
    {
    }

    public DbSet<Category> Categories { get; set; }
    public DbSet<TimeEntry> TimeEntries { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure entity mappings to match existing SQLite database
        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("Categories");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Color).IsRequired().HasDefaultValue("#10b981");
            entity.Property(e => e.IsArchived).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        modelBuilder.Entity<TimeEntry>(entity =>
        {
            entity.ToTable("TimeEntries");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.Hours).IsRequired();
            entity.Property(e => e.Description).IsRequired();

            entity.HasOne(e => e.Category)
                .WithMany(c => c.TimeEntries)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
