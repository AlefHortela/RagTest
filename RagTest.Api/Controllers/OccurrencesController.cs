using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RagTest.Api.Data;
using RagTest.Api.DTOs;
using RagTest.Api.Entities;
using RagTest.Api.Services;

namespace RagTest.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class OccurrencesController(
    AppDbContext db,
    IRagIngestionService ragIngestion,
    IFileStorageService storage) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<OccurrenceResponse>>> List(CancellationToken ct)
    {
        var occurrences = await db.Occurrences
            .Include(o => o.Attachments)
            .OrderByDescending(o => o.OccurredAt)
            .ToListAsync(ct);

        return Ok(occurrences.Select(OccurrenceResponse.FromEntity));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OccurrenceResponse>> Get(Guid id, CancellationToken ct)
    {
        var occurrence = await db.Occurrences
            .Include(o => o.Attachments)
            .SingleOrDefaultAsync(o => o.Id == id, ct);

        if (occurrence is null)
            return NotFound();

        return Ok(OccurrenceResponse.FromEntity(occurrence));
    }

    [HttpPost]
    public async Task<ActionResult<OccurrenceResponse>> Create(OccurrenceCreateRequest request, CancellationToken ct)
    {
        var occurrence = new Occurrence
        {
            Id = Guid.NewGuid(),
            Type = request.Type,
            Title = request.Title,
            Description = request.Description,
            OccurredAt = request.OccurredAt,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Address = request.Address,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        db.Occurrences.Add(occurrence);
        await db.SaveChangesAsync(ct);

        await ragIngestion.IndexOccurrenceAsync(occurrence, ct);

        return CreatedAtAction(nameof(Get), new { id = occurrence.Id }, OccurrenceResponse.FromEntity(occurrence));
    }

    [HttpPost("{id:guid}/attachments")]
    public async Task<ActionResult<AttachmentResponse>> UploadAttachment(Guid id, IFormFile file, CancellationToken ct)
    {
        var occurrence = await db.Occurrences.SingleOrDefaultAsync(o => o.Id == id, ct);
        if (occurrence is null)
            return NotFound();

        await using var stream = file.OpenReadStream();
        var relativePath = await storage.SaveAsync(id, file.FileName, stream, ct);

        var attachment = new Attachment
        {
            Id = Guid.NewGuid(),
            OccurrenceId = id,
            FileName = file.FileName,
            FilePath = relativePath,
            ContentType = file.ContentType,
            FileSize = file.Length,
            UploadedAt = DateTimeOffset.UtcNow
        };

        db.Attachments.Add(attachment);
        await db.SaveChangesAsync(ct);

        await ragIngestion.IndexAttachmentAsync(attachment, ct);

        return Ok(new AttachmentResponse(attachment.Id, attachment.FileName, attachment.ContentType, attachment.FileSize, attachment.UploadedAt));
    }
}
