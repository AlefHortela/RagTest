using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;

namespace RagTest.Api.Services;

public interface IOllamaService
{
    Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken ct = default);
    Task<string> ChatAsync(IEnumerable<OllamaChatMessage> messages, CancellationToken ct = default);
}

public record OllamaChatMessage(string Role, string Content);

public class OllamaOptions
{
    public const string SectionName = "Ollama";

    public string BaseUrl { get; set; } = "http://localhost:11434";
    public string EmbeddingModel { get; set; } = "nomic-embed-text";
    public string ChatModel { get; set; } = "llama3.1";
}

public class OllamaService(HttpClient httpClient, IOptions<OllamaOptions> options) : IOllamaService
{
    private readonly OllamaOptions _options = options.Value;

    public async Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken ct = default)
    {
        var response = await httpClient.PostAsJsonAsync("api/embeddings", new EmbeddingRequest
        {
            Model = _options.EmbeddingModel,
            Prompt = text
        }, ct);

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<EmbeddingResponse>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Resposta vazia do Ollama ao gerar embedding.");

        return result.Embedding;
    }

    public async Task<string> ChatAsync(IEnumerable<OllamaChatMessage> messages, CancellationToken ct = default)
    {
        var response = await httpClient.PostAsJsonAsync("api/chat", new ChatRequest
        {
            Model = _options.ChatModel,
            Messages = messages.Select(m => new ChatMessageDto { Role = m.Role, Content = m.Content }).ToList(),
            Stream = false
        }, ct);

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<ChatResponse>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Resposta vazia do Ollama no chat.");

        return result.Message.Content;
    }

    private class EmbeddingRequest
    {
        [JsonPropertyName("model")] public string Model { get; set; } = string.Empty;
        [JsonPropertyName("prompt")] public string Prompt { get; set; } = string.Empty;
    }

    private class EmbeddingResponse
    {
        [JsonPropertyName("embedding")] public float[] Embedding { get; set; } = [];
    }

    private class ChatRequest
    {
        [JsonPropertyName("model")] public string Model { get; set; } = string.Empty;
        [JsonPropertyName("messages")] public List<ChatMessageDto> Messages { get; set; } = [];
        [JsonPropertyName("stream")] public bool Stream { get; set; }
    }

    private class ChatMessageDto
    {
        [JsonPropertyName("role")] public string Role { get; set; } = string.Empty;
        [JsonPropertyName("content")] public string Content { get; set; } = string.Empty;
    }

    private class ChatResponse
    {
        [JsonPropertyName("message")] public ChatMessageDto Message { get; set; } = new();
    }
}
