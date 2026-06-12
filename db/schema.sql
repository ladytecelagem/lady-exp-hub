-- LADY EXPORT HUB — schema núcleo
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ENUMS
CREATE TYPE user_status     AS ENUM ('active','blocked','pending');
CREATE TYPE channel_type    AS ENUM ('private','group','department','client','project','order','development');
CREATE TYPE msg_type        AS ENUM ('text','audio','video','image','file');
CREATE TYPE process_type    AS ENUM ('sample','development','sales_order','export','production','complaint','support');
CREATE TYPE process_status  AS ENUM ('open','in_progress','blocked','approved','done','overdue');
CREATE TYPE rule_scope      AS ENUM ('client','country');
CREATE TYPE doc_type        AS ENUM ('commercial_invoice','packing_list','proforma','shipping_instructions','certificate_origin','fumigation','declaration','custom');
CREATE TYPE doc_status      AS ENUM ('draft','validated','issued','rejected');
CREATE TYPE capture_source  AS ENUM ('pdf','image','word','excel','email');

-- IAM / TENANT
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, logo_url text, favicon_url text,
  colors jsonb DEFAULT '{}', theme text DEFAULT 'light',
  locales text[] DEFAULT '{pt,en,es}',
  created_at timestamptz DEFAULT now()
);
-- Supabase: login via Auth. users = perfil ligado ao auth.users
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  full_name text, status user_status DEFAULT 'active',
  default_locale text DEFAULT 'pt', is_client boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE, name text NOT NULL
);
-- permissão granular: módulo/tela/botão/campo
CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL, screen text, action text, field text
);
CREATE TABLE role_permissions (role_id uuid REFERENCES roles(id) ON DELETE CASCADE, permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE, allow boolean DEFAULT true, PRIMARY KEY(role_id,permission_id));
CREATE TABLE user_roles (user_id uuid REFERENCES users(id) ON DELETE CASCADE, role_id uuid REFERENCES roles(id) ON DELETE CASCADE, PRIMARY KEY(user_id,role_id));

-- COMMUNICATION + TRANSLATION
CREATE TABLE channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  type channel_type NOT NULL, name text,
  ref_type text, ref_id uuid, created_at timestamptz DEFAULT now()
);
CREATE TABLE channel_members (channel_id uuid REFERENCES channels(id) ON DELETE CASCADE, user_id uuid REFERENCES users(id) ON DELETE CASCADE, PRIMARY KEY(channel_id,user_id));
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id), parent_id uuid REFERENCES messages(id),
  type msg_type DEFAULT 'text',
  content_original text, locale_original text,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE message_translations (
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  locale text NOT NULL, content text NOT NULL,
  PRIMARY KEY(message_id,locale)
);
CREATE TABLE attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  file_url text, mime text, size_bytes bigint
);
CREATE TABLE reactions (message_id uuid REFERENCES messages(id) ON DELETE CASCADE, user_id uuid REFERENCES users(id), emoji text, PRIMARY KEY(message_id,user_id,emoji));
CREATE TABLE mentions (message_id uuid REFERENCES messages(id) ON DELETE CASCADE, user_id uuid REFERENCES users(id), PRIMARY KEY(message_id,user_id));

-- CATALOG + CROSS-REFERENCE
CREATE TABLE countries (iso2 char(2) PRIMARY KEY, name text NOT NULL);
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL, country_iso2 char(2) REFERENCES countries(iso2), default_locale text
);
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  internal_code text NOT NULL, internal_name text,
  ncm text, composition text,
  UNIQUE(company_id,internal_code)
);
CREATE TABLE product_cross_refs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  client_code text, client_name text, locale text,
  commercial_desc text, hts_code text, notes text
);

-- RULES ENGINE (cliente / país)
CREATE TABLE rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  scope rule_scope NOT NULL, ref_id uuid NOT NULL,
  key text NOT NULL, value jsonb DEFAULT '{}', required boolean DEFAULT false
);

-- PROCESS MGMT (numeração automática)
CREATE SEQUENCE process_seq;
CREATE TABLE processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  number text UNIQUE DEFAULT ('PRC-'||lpad(nextval('process_seq')::text,8,'0')),
  type process_type NOT NULL, status process_status DEFAULT 'open',
  client_id uuid REFERENCES clients(id), sla_due timestamptz,
  channel_id uuid REFERENCES channels(id),
  created_at timestamptz DEFAULT now()
);
CREATE TABLE process_responsibles (process_id uuid REFERENCES processes(id) ON DELETE CASCADE, user_id uuid REFERENCES users(id), PRIMARY KEY(process_id,user_id));
CREATE TABLE process_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id uuid REFERENCES processes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id), action text, payload jsonb, created_at timestamptz DEFAULT now()
);
CREATE TABLE process_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id uuid REFERENCES processes(id) ON DELETE CASCADE,
  approver_id uuid REFERENCES users(id), approved boolean, note text, created_at timestamptz DEFAULT now()
);

-- EXPORT DOCS + TEMPLATES + NF-e
CREATE TABLE doc_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  type doc_type NOT NULL, country_iso2 char(2), client_id uuid REFERENCES clients(id),
  body jsonb NOT NULL
);
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id uuid REFERENCES processes(id) ON DELETE CASCADE,
  type doc_type NOT NULL, template_id uuid REFERENCES doc_templates(id),
  status doc_status DEFAULT 'draft', file_url text, payload jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE nfe_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  source_type text, raw text, parsed jsonb, created_at timestamptz DEFAULT now()
);

-- VALIDATION (IA pré-emissão)
CREATE TABLE validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  checklist jsonb, divergences jsonb, status text, created_at timestamptz DEFAULT now()
);

-- OCR CAPTURES
CREATE TABLE captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  source capture_source, file_url text, extracted jsonb,
  process_id uuid REFERENCES processes(id), created_at timestamptz DEFAULT now()
);

-- KNOWLEDGE BASE + RAG
CREATE TABLE kb_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  title text, source text, created_at timestamptz DEFAULT now()
);
CREATE TABLE kb_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kb_document_id uuid REFERENCES kb_documents(id) ON DELETE CASCADE,
  content text, embedding vector(1536)
);
-- memória corporativa de exportação
CREATE TABLE kb_solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  problem text, solution text, country_iso2 char(2), client_id uuid REFERENCES clients(id),
  tags text[], created_at timestamptz DEFAULT now()
);

-- AI CONFIG + LOGS
CREATE TABLE ai_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  provider text, model text, key_enc text
);
CREATE TABLE ai_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  user_id uuid REFERENCES users(id),
  prompt text, response text, sources jsonb, cost numeric(12,6), created_at timestamptz DEFAULT now()
);

-- AUDIT
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid, user_id uuid, entity text, entity_id uuid,
  action text, before jsonb, after jsonb, created_at timestamptz DEFAULT now()
);

-- ÍNDICES
CREATE INDEX idx_msg_channel       ON messages(channel_id, created_at);
CREATE INDEX idx_proc_company_stat ON processes(company_id, status);
CREATE INDEX idx_xref_product      ON product_cross_refs(product_id);
CREATE INDEX idx_xref_client_code  ON product_cross_refs(client_id, client_code);
CREATE INDEX idx_rules_scope       ON rules(company_id, scope, ref_id);
CREATE INDEX idx_kb_chunks_vec     ON kb_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists=100);
CREATE INDEX idx_kb_sol_country    ON kb_solutions(company_id, country_iso2);
