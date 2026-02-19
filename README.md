# IRREVERSO UNIVERSE — Repository

Este repositório mantém a infraestrutura do **IRREVERSO**:
um ambiente híbrido (camada pública + camadas ocultas) que funciona como extensão do universo narrativo.

Não é um “site de autor”.
É uma interface. Um arquivo. Um portal.

---

## O que existe aqui

- **Camada pública (Surface):** páginas acessíveis e legíveis, com estética minimalista e curiosidade guiada.
- **Camada oculta (Archive):** conteúdo fragmentado, rotas/artefatos, transmissões e sinais (ARG-friendly).
- **Camada técnica (Engine):** código, automações, deploy e padronização para evolução contínua.

---

## Estrutura (proposta)

| Pasta | Função |
|------|------|
| `canon/` | Conteúdo canônico “congelado” (não editar automaticamente) |
| `transmissions/` | Mensagens/fragmentos liberados (NUVE/feeds/sinais) |
| `archive/` | Artefatos, chaves, camadas ocultas e trilhas |
| `legal/` | Provas técnicas de versionamento (hashes, edições, manifesto de integridade) |
| `public/` | Assets públicos (imagens, ícones, fontes) |
| `app/` ou `src/` | Código do site (depende do framework) |

> Regra de ouro: o **canônico** não é refatorado por IA, apenas versionado.

---

## Rodar localmente

```bash
npm install
npm run dev
