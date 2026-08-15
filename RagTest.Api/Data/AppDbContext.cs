using Microsoft.EntityFrameworkCore;
using RagTest.Api.Entities;

namespace RagTest.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Occurrence> Occurrences => Set<Occurrence>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<RagChunk> RagChunks => Set<RagChunk>();
    public DbSet<AppSetting> AppSettings => Set<AppSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("vector");
        modelBuilder.HasPostgresEnum<OccurrenceType>();

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Username).IsUnique();
        });

        modelBuilder.Entity<Occurrence>(e =>
        {
            e.HasMany(o => o.Attachments)
                .WithOne(a => a.Occurrence)
                .HasForeignKey(a => a.OccurrenceId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RagChunk>(e =>
        {
            e.Property(r => r.Embedding).HasColumnType($"vector({RagChunk.EmbeddingDimensions})");
            e.HasIndex(r => r.Embedding).HasMethod("hnsw").HasOperators("vector_cosine_ops");
            e.HasIndex(r => new { r.SourceType, r.SourceId });
        });

        modelBuilder.Entity<AppSetting>().HasData(new AppSetting
        {
            Id = 1,
            AttachmentsPath = "Storage/Attachments"
        });
    }
}
