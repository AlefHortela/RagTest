using Pgvector;

namespace RagTest.Api.Entities;

public class RagChunk
{
    public const int EmbeddingDimensions = 768; // nomic-embed-text

    public Guid Id { get; set; }
    public string SourceType { get; set; } = string.Empty; // RagSourceType.Occurrence | Attachment
    public Guid SourceId { get; set; }
    public int ChunkIndex { get; set; }
    public string Content { get; set; } = string.Empty;
    public Vector Embedding { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
}
