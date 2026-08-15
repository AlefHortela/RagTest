namespace RagTest.Api.DTOs;

public record ChatRequest(string Question);

public record ChatSource(Guid OccurrenceId, string SourceType, string Excerpt);

public record ChatResponse(string Answer, List<ChatSource> Sources);
