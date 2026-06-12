import { createClient } from '@supabase/supabase-js';
import { translate } from '@/lib/translate';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);
const LOCALES = ['pt', 'en', 'es'];
export async function GET(req: Request) {
  const u = new URL(req.url);
  if (u.searchParams.get('type') === 'channels') { const { data } = await db.from('channels').select('id,name,type').order('created_at'); return Response.json(data ?? []); }
  const channel = u.searchParams.get('channel');
  const { data } = await db.from('messages').select('id,content_original,locale_original,sender_id,created_at,message_translations(locale,content)').eq('channel_id', channel).order('created_at');
  return Response.json(data ?? []);
}
export async function POST(req: Request) {
  const b = await req.json();
  if (b.type === 'channel') {
    const { data: comp } = await db.from('companies').select('id').limit(1).single();
    const { data, error } = await db.from('channels').insert({ name: b.name, type: 'group', company_id: comp?.id }).select('id,name,type').single();
    return error ? Response.json({ error: error.message }, { status: 400 }) : Response.json(data);
  }
  const src = b.locale || 'pt';
  const { data: msg, error } = await db.from('messages').insert({ channel_id: b.channel_id, sender_id: b.sender_id, content_original: b.content, locale_original: src }).select('id').single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const targets = LOCALES.filter((l) => l !== src); const rows = [];
  for (const t of targets) rows.push({ message_id: msg.id, locale: t, content: await translate(b.content, src, t) });
  if (rows.length) await db.from('message_translations').insert(rows);
  return Response.json({ ok: true });
}
