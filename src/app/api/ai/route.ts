import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);

export async function POST(req: Request) {
  const { q } = await req.json();
  if (!q || !q.trim()) return Response.json({ answer: 'Faça uma pergunta.', sources: [] });
  const term = '%' + q + '%';
  const sources: any[] = [];

  const { data: sol } = await db.from('kb_solutions')
    .select('problem,solution,country_iso2').or(`problem.ilike.${term},solution.ilike.${term}`).limit(5);
  (sol || []).forEach((s) => sources.push({ tipo: 'Base de conhecimento', titulo: s.problem, conteudo: s.solution, extra: s.country_iso2 }));

  const { data: proc } = await db.from('processes')
    .select('number,type,status').or(`number.ilike.${term},type.ilike.${term}`).limit(5);
  (proc || []).forEach((p) => sources.push({ tipo: 'Processo', titulo: p.number, conteudo: `${p.type} — ${p.status}` }));

  const { data: msgs } = await db.from('messages')
    .select('content_original,created_at').ilike('content_original', term).limit(5);
  (msgs || []).forEach((m) => sources.push({ tipo: 'Mensagem', titulo: new Date(m.created_at).toLocaleDateString('pt-BR'), conteudo: m.content_original }));

  const answer = sources.length
    ? `Encontrei ${sources.length} referência(s) relacionadas a "${q}". Veja as fontes abaixo.`
    : `Não encontrei nada sobre "${q}" na base ainda. Cadastre soluções na Export Knowledge Base para enriquecer as respostas.`;
  return Response.json({ answer, sources });
}
