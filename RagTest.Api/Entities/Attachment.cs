namespace RagTest.Api.Entities;

public class Attachment
{
    public Guid Id { get; set; }
    public Guid OccurrenceId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTimeOffset UploadedAt { get; set; }

    public Occurrence? Occurrence { get; set; }
}
