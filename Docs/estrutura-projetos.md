# Estrutura dos Projetos

## Backend — `RagTest.Api` (ASP.NET Core Web API)

Projeto único, sem camadas extras (POC — evitar over-engineering).

```
RagTest.Api/
  Controllers/
    AuthController.cs        -> login (JWT)
    OccurrencesController.cs -> CRUD + upload de anexos
    ChatController.cs        -> pergunta -> embed -> busca pgvector -> Ollama chat
    SettingsController.cs    -> GET/PUT do caminho de upload dos anexos
  Entities/
    User.cs, Occurrence.cs, Attachment.cs, RagChunk.cs, AppSetting.cs
  Data/
    AppDbContext.cs          -> EF Core + Npgsql.EntityFrameworkCore.PostgreSQL + Pgvector.EntityFrameworkCore
  Services/
    OllamaService.cs         -> chama http://localhost:11434 (/api/embeddings, /api/chat)
    RagIngestionService.cs   -> gera chunk + embedding ao salvar ocorrência/anexo
    FileStorageService.cs    -> grava/lê arquivos na pasta configurada (lida do AppSetting no banco)
    AuthService.cs           -> hash de senha + emissão de JWT
```

## Frontend — Angular

```
src/app/
  auth/          -> login, guard, interceptor JWT
  occurrences/   -> lista, formulário de criação (com mapa Leaflet para lat/long), detalhe (upload de anexos)
  chat/          -> tela de conversa com a LLM (consulta o RAG)
  settings/      -> tela de configuração da pasta de upload dos anexos
  core/          -> services HTTP (occurrence.service, chat.service, auth.service, settings.service)
```

- Mapa: Leaflet + OpenStreetMap, sem wrapper Angular adicional — componente próprio simples para o pick de lat/long. O ícone padrão do Leaflet precisa do fix `delete L.Icon.Default.prototype._getIconUrl` antes de `mergeOptions` (bug conhecido do Leaflet com bundlers), e os PNGs ficam em `public/leaflet/` (caminho absoluto, funciona igual em dev/build).
- Layout do formulário de ocorrência é em duas colunas (campos à esquerda, mapa à direita), com quebra para uma coluna em telas abaixo de 800px.
- Em dev, o front chama o backend via `http://localhost:5127/api` (perfil HTTP do Kestrel) em vez de HTTPS, para evitar fricção com o certificado de desenvolvimento autoassinado no navegador.
