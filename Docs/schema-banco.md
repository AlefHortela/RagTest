# Schema do Banco (Postgres + pgvector)

Banco único: `ragtest` (já provisionado em `docker-compose.yml`).

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE occurrence_type AS ENUM ('acidente', 'assalto', 'outro');

CREATE TABLE occurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type occurrence_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    occurrence_id UUID NOT NULL REFERENCES occurrences(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,       -- caminho relativo na pasta local
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Uma linha por "pedaço" de texto que vira embedding.
-- Para textos pequenos, geralmente 1 chunk = 1 ocorrência/anexo inteiro.
CREATE TABLE rag_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(20) NOT NULL,   -- 'occurrence' | 'attachment'
    source_id UUID NOT NULL,
    chunk_index INT NOT NULL DEFAULT 0,
    content TEXT NOT NULL,
    embedding vector(768) NOT NULL,     -- 768 = dimensão do nomic-embed-text
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX rag_chunks_embedding_idx
    ON rag_chunks USING hnsw (embedding vector_cosine_ops);

-- Linha única (id = 1) com configurações editáveis pela tela de Configurações no front.
CREATE TABLE app_settings (
    id INT PRIMARY KEY,
    attachments_path TEXT NOT NULL
);

INSERT INTO app_settings (id, attachments_path) VALUES (1, 'Storage/Attachments');
```

## Notas de modelagem

- `rag_chunks` é polimórfica (`source_type` + `source_id`) para indexar tanto a descrição da ocorrência quanto o conteúdo extraído de anexos, sem duas tabelas de embedding separadas.
- Dimensão `768` assume o modelo `nomic-embed-text`. Se trocar para `mxbai-embed-large`, ajustar para `vector(1024)`.
- Índice HNSW já preparado para busca por similaridade de cosseno.
- `app_settings` é uma tabela de linha única (convenção `id = 1`) em vez de key-value genérico — só existe uma configuração (pasta de anexos) por enquanto; se surgirem mais, dá pra virar key-value depois sem migração destrutiva.
