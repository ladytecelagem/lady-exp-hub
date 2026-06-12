import { createClient } from '@supabase/supabase-js';
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function GET() {
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json(data.users.map((u) => ({ id: u.id, email: u.email, created_at: u.created_at })));
}

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const { data: comp } = await admin.from('companies').select('id').limit(1).single();
  await admin.from('users').insert({ id: data.user.id, company_id: comp?.id, full_name: email });
  return Response.json({ id: data.user.id, email: data.user.email });
}
