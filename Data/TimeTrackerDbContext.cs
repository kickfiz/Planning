using Microsoft.EntityFrameworkCore;
using Planning.Models;

namespace Planning.Data;

public class TimeTrackerDbContext : DbContext
{
    public TimeTrackerDbContext(DbContextOptions<TimeTrackerDbContext> options)
        : base(options)
    {
    }

    public DbSet<TimeEntry> TimeEntries { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TimeEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.Hours).HasPrecision(4, 1);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.TimeEntries)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.Property(c => c.Color).IsRequired().HasMaxLength(7);
            entity.Property(c => c.IsArchived).IsRequired();
            entity.Property(c => c.CreatedAt).IsRequired();
        });
    }
}
