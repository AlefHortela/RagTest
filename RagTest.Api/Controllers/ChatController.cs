using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pgvector;
using Pgvector.EntityFrameworkCore;
using RagTest.Api.Data;
using RagTest.Api.DTOs;
using RagTest.Api.Services;

namespace RagTest.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ChatController(AppDbContext db, IOllamaService ollama) : ControllerBase
{
    private const int TopK = 5;

    [HttpPost]
    public async Task<ActionResult<ChatResponse>> Ask(ChatRequest request, CancellationToken ct)
    {
        var questionEmbedding = new Vector(await ollama.GenerateEmbeddingAsync(request.Question, ct));

        var chunks = await db.RagChunks
            .OrderBy(c => c.Embedding.CosineDistance(questionEmbedding))
            .Take(TopK)
            .ToListAsync(ct);

        var context = string.Join(
            "\n\n",
            chunks.Select((c, i) => $"{i + 1}. {c.Content}"));

        var messages = new[]
        {
            new OllamaChatMessage("system",
                "Você é um assistente que consulta um sistema de registro de ocorrências (acidentes, assaltos, etc). " +
                "Abaixo estão trechos de ocorrências recuperados por busca semântica, cada um numerado. " +
                "Responda à mensagem do usuário com base nesses trechos: se for uma pergunta específica, responda diretamente; " +
                "se for um pedido mais aberto (um tópico, um local, um tipo de ocorrência), resuma as ocorrências relevantes " +
                "encontradas (quantas, tipos, locais, datas se disponíveis). Só diga que não encontrou informação suficiente " +
                "se nenhum trecho abaixo tiver relação com o pedido.\n\n" +
                $"Ocorrências recuperadas:\n{context}"),
            new OllamaChatMessage("user", request.Question)
        };

        var answer = await ollama.ChatAsync(messages, ct);

        var sources = chunks
            .Select(c => new ChatSource(c.SourceId, c.SourceType, Truncate(c.Content, 200)))
            .ToList();

        return Ok(new ChatResponse(answer, sources));
    }

    private static string Truncate(string text, int maxLength) =>
        text.Length <= maxLength ? text : text[..maxLength] + "...";
}
