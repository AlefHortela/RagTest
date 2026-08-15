# RagTest

Projeto de teste para implementação de RAG (Retrieval-Augmented Generation) 100% local.

## Requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download) (backend, `RagTest.Api`)
- [Node.js](https://nodejs.org/) + npm (frontend, `ragtest-web` — Angular 22)
- [Docker](https://www.docker.com/) ou [Podman](https://podman.io/) (para subir o Postgres com pgvector via `docker-compose.yml` — arquivo compatível com ambos)
- [Ollama](https://ollama.com/) instalado localmente, com os modelos:
  - `nomic-embed-text` (embeddings)
  - `llama3.1` (chat)
- `dotnet-ef` (CLI do Entity Framework Core, para aplicar as migrations)

## Ideia Original

- Aplicação em **Angular** (frontend) e **C# / ASP.NET Core** (backend).
- Registro de ocorrências gerais (acidentes, assaltos, etc.), salvas em **Postgres** (dados estruturados) e em **disco local** (arquivos anexados).
- Chat com uma LLM no frontend para consultar os dados via RAG.
- RAG implementado com **pgvector** sobre o próprio Postgres — sem banco separado para os embeddings.
- LLM e embeddings rodando via **Ollama**, localmente, sem dados saindo para serviços externos.
- Seleção de localização das ocorrências via mapa (**Leaflet + OpenStreetMap**), gerando lat/long.
- Autenticação básica (JWT) tanto no frontend quanto na API.

O objetivo é validar o conceito de RAG local, sem foco em performance ou escala. Mais detalhes das decisões técnicas, schema do banco e estrutura dos projetos estão em [Docs](Docs/).

## Como Rodar

### 1. Subir o Postgres (com pgvector)

```bash
docker compose up -d
# ou, via Podman:
podman compose up -d
```

Isso sobe o Postgres na porta `5432` (banco `ragtest`, usuário/senha `postgres`/`postgres`).

### 2. Preparar o Ollama

Com o Ollama instalado e rodando (`http://localhost:11434`), baixe os modelos usados:

```bash
ollama pull nomic-embed-text
ollama pull llama3.1
```

### 3. Rodar o backend (`RagTest.Api`)

Aplique as migrations do Entity Framework para criar o schema no Postgres:

```bash
cd RagTest.Api
dotnet ef database update
```

Depois inicie a API:

```bash
dotnet run
```

A API sobe em `http://localhost:5127` (ou `https://localhost:7090`). As configurações de conexão (Postgres, Ollama, JWT) ficam em [appsettings.json](RagTest.Api/appsettings.json).

### 4. Rodar o frontend (`ragtest-web`)

```bash
cd ragtest-web
npm install
npm start
```

A aplicação Angular sobe em `http://localhost:4200` e já está configurada (CORS) para consumir a API em `http://localhost:5127`.
