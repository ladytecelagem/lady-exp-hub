import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);
export async function POST(req: Request) {
  const { name, type, dataBase64 } = await req.json();
  await db.storage.createBucket('chat', { public: true }).catch(() => {});
  const path = Date.now() + '_' + (name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
  const buffer = Buffer.from(dataBase64, 'base64');
  const { error } = await db.storage.from('chat').upload(path, buffer, { contentType: type || 'application/octet-stream', upsert: false });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const { data } = db.storage.from('chat').getPublicUrl(path);
  return Response.json({ url: data.publicUrl, name, type });
}
