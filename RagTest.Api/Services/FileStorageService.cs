using Microsoft.EntityFrameworkCore;
using RagTest.Api.Data;

namespace RagTest.Api.Services;

public interface IFileStorageService
{
    Task<string> SaveAsync(Guid occurrenceId, string fileName, Stream content, CancellationToken ct = default);
    Task<string> ReadTextAsync(string relativePath, CancellationToken ct = default);
    Task<string> GetFullPathAsync(string relativePath, CancellationToken ct = default);
}

public class FileStorageService(AppDbContext db) : IFileStorageService
{
    public async Task<string> SaveAsync(Guid occurrenceId, string fileName, Stream content, CancellationToken ct = default)
    {
        var rootPath = await GetRootPathAsync(ct);
        var occurrenceDir = Path.Combine(rootPath, occurrenceId.ToString());
        Directory.CreateDirectory(occurrenceDir);

        var safeFileName = $"{Guid.NewGuid()}_{Path.GetFileName(fileName)}";
        var fullPath = Path.Combine(occurrenceDir, safeFileName);

        await using (var fileStream = File.Create(fullPath))
        {
            await content.CopyToAsync(fileStream, ct);
        }

        return Path.Combine(occurrenceId.ToString(), safeFileName);
    }

    public async Task<string> ReadTextAsync(string relativePath, CancellationToken ct = default)
        => await File.ReadAllTextAsync(await GetFullPathAsync(relativePath, ct), ct);

    public async Task<string> GetFullPathAsync(string relativePath, CancellationToken ct = default)
        => Path.Combine(await GetRootPathAsync(ct), relativePath);

    private async Task<string> GetRootPathAsync(CancellationToken ct)
    {
        var settings = await db.AppSettings.AsNoTracking().SingleAsync(ct);
        return settings.AttachmentsPath;
    }
}
