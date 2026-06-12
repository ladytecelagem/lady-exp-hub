import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);
export async function GET() {
  const { data } = await db.from('companies').select('features').limit(1).single();
  return Response.json(data?.features ?? {});
}
export async function PUT(req: Request) {
  const b = await req.json();
  const { data: comp } = await db.from('companies').select('id').limit(1).single();
  if (!comp) return Response.json({ error: 'Sem empresa' }, { status: 400 });
  const { error } = await db.from('companies').update({ features: b.features }).eq('id', comp.id);
  return error ? Response.json({ error: error.message }, { status: 400 }) : Response.json({ ok: true });
}
