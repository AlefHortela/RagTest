# Decisões Técnicas

## LLM / Embeddings — Ollama (local)

- Roda 100% local, sem enviar dados para fora.
- Modelo de embedding: `nomic-embed-text` (768 dimensões) — leve e adequado para textos curtos.
  - Alternativa: `mxbai-embed-large` (1024 dims), se precisar de mais qualidade.
- Modelo de chat: a definir (ex: `llama3.1`, `mistral`) — usado para responder perguntas com base no contexto recuperado do RAG.
- A dimensão do embedding escolhido precisa bater exatamente com a coluna `vector(N)` no Postgres.

## Ingestão de conteúdo

- Textos pequenos: sem necessidade de chunking (1 chunk = 1 ocorrência/anexo).
- Arquivos aceitos: `.txt` e PDFs de texto puro (extração simples, sem OCR — ex: PdfPig em C#).
  - PDF pode ser removido do escopo depois se causar problemas de extração.
- Pipeline **síncrono**: embedding é gerado no mesmo request que salva o registro. Aceitável para teste; lentidão não é um problema neste estágio.

## Armazenamento

- Um único banco Postgres (`ragtest`, já provisionado via `docker-compose.yml` com imagem `pgvector/pgvector:pg16`) para dados de aplicação e dados de RAG — não é necessário banco separado.
  - pgvector é uma extensão por banco (`CREATE EXTENSION vector`), então convivem no mesmo database sem problema.
  - Permite foreign keys diretas entre tabelas de ocorrência e tabelas de embedding.
- Arquivos anexados: pasta local no disco da máquina. O caminho é **configurável em runtime** pela tela de Configurações (`/settings`) no front, salvo na tabela `app_settings` (linha única) — não é mais fixo no `appsettings.json`. `FileStorageService` consulta o banco a cada operação para resolver o caminho atual.

## Autenticação

- Autenticação básica tanto no frontend quanto nas APIs (JWT), para evitar acesso indevido — sem necessidade de um provedor de identidade completo neste estágio.

## Geolocalização

- Latitude/longitude (colunas simples `double precision`) são suficientes para o escopo atual.
- PostGIS não é necessário a menos que surjam queries espaciais mais complexas (buscas por área, polígonos).
- Seleção do ponto no mapa via **Leaflet + OpenStreetMap** no frontend (gratuito, sem API key, sem serviço externo) — clique no mapa retorna `lat`/`lng` para preencher o formulário.

## Busca (similarity vs. híbrida)

- Começar com busca por similaridade pura via pgvector (`<=>`, cosine).
- Migração futura para busca híbrida (combinando com full-text search do Postgres `tsvector` ou filtros estruturados) é simples — não exige mudança de schema nem reprocessamento dos embeddings existentes.

## HTTPS em desenvolvimento

- O front chama o backend via HTTP (`http://localhost:5127/api`) em vez do HTTPS padrão do Kestrel (`https://localhost:7090`). O certificado de desenvolvimento autoassinado do ASP.NET Core não é confiável por padrão em todo navegador/ambiente, e `dotnet dev-certs https --trust` nem sempre resolve (depende de conseguir confirmar um prompt de UI). Para uma aplicação 100% local de teste, HTTP evita essa fricção sem comprometer nada (não há rede externa envolvida).
- `UseHttpsRedirection()` só é aplicado quando `!Environment.IsDevelopment()`, para não forçar redirect de volta pra HTTPS em dev.
