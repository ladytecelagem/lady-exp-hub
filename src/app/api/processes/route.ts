import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);
export async function GET() {
  const { data, error } = await db.from('processes').select('id,number,type,status,created_at').order('created_at',{ascending:false});
  if (error) return Response.json({ error: error.message }, { status: 400 }); return Response.json(data);
}
export async function POST(req: Request) {
  const body = await req.json();
  const { data: comp } = await db.from('companies').select('id').limit(1).single();
  const { data, error } = await db.from('processes').insert({ type: body.type, company_id: comp?.id }).select('id,number,type,status,created_at').single();
  if (error) return Response.json({ error: error.message }, { status: 400 }); return Response.json(data);
}
