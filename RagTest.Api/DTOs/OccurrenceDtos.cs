using RagTest.Api.Entities;

namespace RagTest.Api.DTOs;

public record OccurrenceCreateRequest(
    OccurrenceType Type,
    string Title,
    string Description,
    DateTimeOffset OccurredAt,
    double? Latitude,
    double? Longitude,
    string? Address);

public record AttachmentResponse(Guid Id, string FileName, string ContentType, long FileSize, DateTimeOffset UploadedAt);

public record OccurrenceResponse(
    Guid Id,
    OccurrenceType Type,
    string Title,
    string Description,
    DateTimeOffset OccurredAt,
    double? Latitude,
    double? Longitude,
    string? Address,
    DateTimeOffset CreatedAt,
    List<AttachmentResponse> Attachments)
{
    public static OccurrenceResponse FromEntity(Occurrence o) => new(
        o.Id, o.Type, o.Title, o.Description, o.OccurredAt, o.Latitude, o.Longitude, o.Address, o.CreatedAt,
        o.Attachments.Select(a => new AttachmentResponse(a.Id, a.FileName, a.ContentType, a.FileSize, a.UploadedAt)).ToList());
}
