import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);
export async function GET(req: Request) {
  const uid = new URL(req.url).searchParams.get('uid');
  const { data } = await db.from('users').select('default_locale').eq('id', uid).single();
  return Response.json(data ?? { default_locale: 'pt' });
}
export async function PUT(req: Request) {
  const { uid, locale } = await req.json();
  const { error } = await db.from('users').update({ default_locale: locale }).eq('id', uid);
  return error ? Response.json({ error: error.message }, { status: 400 }) : Response.json({ ok: true });
}
