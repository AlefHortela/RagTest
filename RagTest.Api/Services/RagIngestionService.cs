using Microsoft.EntityFrameworkCore;
using Pgvector;
using RagTest.Api.Data;
using RagTest.Api.Entities;
using UglyToad.PdfPig;

namespace RagTest.Api.Services;

public interface IRagIngestionService
{
    Task IndexOccurrenceAsync(Occurrence occurrence, CancellationToken ct = default);
    Task IndexAttachmentAsync(Attachment attachment, CancellationToken ct = default);
    string ExtractText(string fullPath, string contentType);
}

public class RagIngestionService(AppDbContext db, IOllamaService ollama, IFileStorageService storage) : IRagIngestionService
{
    public async Task IndexOccurrenceAsync(Occurrence occurrence, CancellationToken ct = default)
    {
        var content = $"{occurrence.Title}\n\n{occurrence.Description}";
        await UpsertChunkAsync(RagSourceType.Occurrence, occurrence.Id, content, ct);
    }

    public async Task IndexAttachmentAsync(Attachment attachment, CancellationToken ct = default)
    {
        var fullPath = await storage.GetFullPathAsync(attachment.FilePath, ct);
        var text = ExtractText(fullPath, attachment.ContentType);

        if (string.IsNullOrWhiteSpace(text))
            return;

        await UpsertChunkAsync(RagSourceType.Attachment, attachment.Id, text, ct);
    }

    public string ExtractText(string fullPath, string contentType)
    {
        if (contentType == "application/pdf")
        {
            using var pdf = PdfDocument.Open(fullPath);
            return string.Join("\n\n", pdf.GetPages().Select(p => p.Text));
        }

        return File.ReadAllText(fullPath);
    }

    private async Task UpsertChunkAsync(string sourceType, Guid sourceId, string content, CancellationToken ct)
    {
        var existing = await db.RagChunks
            .Where(c => c.SourceType == sourceType && c.SourceId == sourceId)
            .ToListAsync(ct);

        db.RagChunks.RemoveRange(existing);

        var embedding = await ollama.GenerateEmbeddingAsync(content, ct);

        db.RagChunks.Add(new RagChunk
        {
            Id = Guid.NewGuid(),
            SourceType = sourceType,
            SourceId = sourceId,
            ChunkIndex = 0,
            Content = content,
            Embedding = new Vector(embedding),
            CreatedAt = DateTimeOffset.UtcNow
        });

        await db.SaveChangesAsync(ct);
    }
}
