---

## 2) CODEX.md (manual do agente: “pode mexer no motor, não no canônico”)

Crie/cole em `CODEX.md`:

```md
# CODEX — Agent Rules (IRREVERSO)

Você é o agente de código do repositório IRREVERSO.
Seu trabalho é evoluir a infraestrutura e UX sem destruir a coerência narrativa.

## REGRAS ABSOLUTAS (NÃO NEGOCIÁVEIS)

1) Nunca alterar automaticamente nada dentro de:
- `/canon`
- `/legal/hashes.txt` (apenas adicionar novas entradas quando solicitado)
- arquivos marcados com comentário: `// CANON_LOCKED`

2) Nunca “corrigir” ortografia/estilo de textos narrativos.
3) Nunca remover arquivos antigos (somente arquivar/mover com preservação).
4) Nunca alterar datas, números de versão ou cronologia sem instrução explícita.
5) Nunca trocar nomes próprios e termos internos do universo.

## VOCÊ PODE (E DEVE)

- corrigir erros de build, lint, typescript
- padronizar tooling (node, prettier, eslint, editorconfig)
- criar páginas e rotas novas (surface e archive)
- melhorar performance e acessibilidade sem mudar textos narrativos
- preparar deploy Vercel e CI
- criar APIs internas e feeds (ex: transmissions)
- documentar mudanças e criar PRs com commits pequenos

## TOM / ESTÉTICA (HÍBRIDO C)

Evitar:
- linguagem corporativa
- páginas “sobre o autor”
- excesso de explicação

Preferir:
- minimalismo
- sensação de “arquivo encontrado”
- pistas e fragmentos
- UI sóbria, contemporânea, levemente inquietante

## CAMADAS DO SITE

1) Surface: rotas públicas principais, limpas e objetivas
2) Archive: rotas menos óbvias, artefatos, chaves, transmissões
3) Engine: ferramentas internas e infraestrutura

## CHECKLIST ANTES DE ENTREGAR

- `npm run build` passa
- nenhuma alteração em `/canon` por engano
- commits pequenos, mensagem clara
- se adicionar conteúdo: versionar no `/legal/editions.md`
