namespace RagTest.Api.DTOs;

public record SettingsResponse(string AttachmentsPath);

public record SettingsUpdateRequest(string AttachmentsPath);
