using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RagTest.Api.Data;
using RagTest.Api.DTOs;

namespace RagTest.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SettingsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<SettingsResponse>> Get(CancellationToken ct)
    {
        var settings = await db.AppSettings.SingleAsync(ct);
        return Ok(new SettingsResponse(settings.AttachmentsPath));
    }

    [HttpPut]
    public async Task<ActionResult<SettingsResponse>> Update(SettingsUpdateRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.AttachmentsPath))
            return BadRequest("O caminho de anexos não pode ser vazio.");

        var settings = await db.AppSettings.SingleAsync(ct);
        settings.AttachmentsPath = request.AttachmentsPath;
        await db.SaveChangesAsync(ct);

        return Ok(new SettingsResponse(settings.AttachmentsPath));
    }
}
