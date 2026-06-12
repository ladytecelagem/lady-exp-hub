'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
type Src = { tipo: string; titulo: string; conteudo: string; extra?: string };
type Turn = { q: string; answer: string; sources: Src[] };
export default function IA() {
  const [q, setQ] = useState(''); const [hist, setHist] = useState<Turn[]>([]); const [loading, setLoading] = useState(false);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) window.location.href = '/login'; }); }, []);
  const perguntar = async () => {
    if (!q.trim()) return; const pergunta = q; setQ(''); setLoading(true);
    const r = await (await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: pergunta }) })).json();
    setHist((h) => [...h, { q: pergunta, answer: r.answer, sources: r.sources }]); setLoading(false);
  };
  return (<Shell title="Assistente IA">
    <div className="max-w-3xl">
      <div className="bg-white rounded-2xl border border-line shadow-soft p-2 flex gap-2 mb-6">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && perguntar()}
          placeholder="Pergunte sobre processos, exportação, clientes..." className="flex-1 px-4 py-3 outline-none rounded-xl" />
        <button onClick={perguntar} disabled={loading} className="bg-ink text-white px-6 rounded-xl font-medium disabled:opacity-50">{loading ? '...' : 'Perguntar'}</button>
      </div>
      <div className="space-y-5">
        {hist.slice().reverse().map((t, i) => (
          <div key={i} className="bg-white rounded-2xl border border-line shadow-soft p-5">
            <div className="text-sm text-muted mb-1">Você perguntou</div>
            <div className="font-medium mb-3">{t.q}</div>
            <div className="text-sm">{t.answer}</div>
            {t.sources.length > 0 && (
              <div className="mt-4 space-y-2">
                {t.sources.map((s, j) => (
                  <div key={j} className="border border-line rounded-xl p-3 text-sm">
                    <span className="text-[11px] uppercase tracking-wide text-muted">{s.tipo}</span>
                    <div className="font-medium">{s.titulo} {s.extra && <span className="text-muted">· {s.extra}</span>}</div>
                    <div className="text-muted">{s.conteudo}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {hist.length === 0 && <p className="text-muted text-sm">Faça uma pergunta — a IA busca na sua base (processos, mensagens, conhecimento) e responde citando as fontes.</p>}
      </div>
    </div>
  </Shell>);
}
