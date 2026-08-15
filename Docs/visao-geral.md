# Visão Geral

Projeto de teste para implementação de RAG (Retrieval-Augmented Generation).

## Ideia

- Aplicação em **Angular** (frontend) e **C# / ASP.NET Core** (backend).
- Registro de ocorrências gerais (acidentes, assaltos, etc.), salvas em **Postgres** (dados estruturados) e em **disco local** (arquivos anexados).
- Chat com uma LLM no frontend para consultar os dados via RAG.
- RAG implementado com **pgvector** sobre o próprio Postgres.

## Escopo do teste

- Ambiente 100% local — sem dados saindo para serviços externos.
- Textos pequenos (descrições de ocorrências), arquivos `.txt` e PDFs de texto puro.
- Prioridade é validar o conceito, não performance ou escala.
