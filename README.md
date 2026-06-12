# LADY EXPORT HUB

Plataforma global da Lady — comunicação, processos e documentação de exportação em um só lugar.
Web app (Next.js) com Supabase (Postgres + pgvector + Auth), publicado na Vercel.

---

## Stack
- **Next.js 14** (App Router) + **TypeScript** + **Tailwind** (tokens do BrandBook Lady)
- **Supabase** — banco PostgreSQL, vetorização (pgvector) e login (JWT + MFA)
- **Vercel** — deploy automático a cada commit

## Estrutura
```
src/
 ├─ app/
 │   ├─ layout.tsx      # layout base (tema BrandBook)
 │   ├─ page.tsx        # home
 │   └─ login/page.tsx  # login (Supabase Auth)
 └─ lib/
     └─ supabase.ts     # cliente Supabase
db/
 └─ schema.sql          # banco completo (rodar no Supabase)
```

---

## Como rodar (100% online)

### 1. Banco (Supabase)
1. Crie um projeto em https://supabase.com
2. SQL Editor → rode:
   ```sql
   create extension if not exists vector;
   create extension if not exists citext;
   ```
3. SQL Editor → cole e rode o conteúdo de `db/schema.sql`.
4. Project Settings → API → copie: **Project URL**, **anon public**, **service_role**.

### 2. Deploy (Vercel)
1. Importe este repositório em https://vercel.com
2. **Root Directory:** vazio (raiz) · **Framework:** Next.js
3. Adicione as variáveis de ambiente (ver abaixo)
4. Deploy.

### 3. Variáveis de ambiente
| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave anon public |
| `SUPABASE_SERVICE_ROLE` | chave service_role (secreta) |

### 4. Criar usuário
Supabase → Authentication → Users → Add user (marque **Auto Confirm**).
Acesse `/login` no site publicado.

---

## Paleta (BrandBook)
| Uso | HEX |
|-----|-----|
| Preto institucional | `#101820` |
| Off-white | `#F7F6F2` |
| Acústica | `#330E23` / `#D4857D` |
| Revestimento | `#1D3C34` / `#BD9B60` |
| Têxtil | `#94A9CB` / `#674230` |
| Store | `#DBC8B6` / `#7C3A2D` |

Fonte institucional: **Silka**.

---

## Roadmap
- [x] Base: auth + tema + banco
- [ ] Chat + tradução automática (PT/EN/ES)
- [ ] Processos (amostra, pedido, exportação) com SLA
- [ ] Export Docs (NF-e → Invoice / Packing List)
- [ ] IA Corporativa (RAG / pgvector)
- [ ] Dashboard executivo · Portal do cliente · Master Admin
