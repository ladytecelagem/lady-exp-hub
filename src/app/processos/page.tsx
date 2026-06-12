'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
type Proc = { id: string; number: string; type: string; status: string; created_at: string };
const TIPOS = ['sample','development','sales_order','export','production','complaint','support'];
const LABEL: Record<string,string> = { sample:'Amostra', development:'Desenvolvimento', sales_order:'Pedido', export:'Exportação', production:'Produção', complaint:'Reclamação', support:'Suporte' };
export default function Processos() {
  const [list, setList] = useState<Proc[]>([]); const [tipo, setTipo] = useState('export'); const [loading, setLoading] = useState(true);
  const carregar = async () => { setList(await (await fetch('/api/processes')).json()); setLoading(false); };
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) window.location.href='/login'; else carregar(); }); }, []);
  const criar = async () => { await fetch('/api/processes', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ type: tipo }) }); carregar(); };
  return (<Shell title="Processos">
    <div className="flex gap-2 mb-6">
      <select value={tipo} onChange={(e)=>setTipo(e.target.value)} className="border border-preto/15 rounded-xl px-3 py-2 bg-white">{TIPOS.map((t)=> <option key={t} value={t}>{LABEL[t]}</option>)}</select>
      <button onClick={criar} className="bg-preto text-white px-4 py-2 rounded-xl font-semibold">+ Novo processo</button>
    </div>
    <div className="bg-white rounded-2xl border border-preto/10 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-offwhite text-preto/60"><tr><th className="px-5 py-3">Número</th><th>Tipo</th><th>Status</th><th>Criado</th></tr></thead>
        <tbody>
          {loading && <tr><td className="px-5 py-4" colSpan={4}>Carregando...</td></tr>}
          {!loading && list.length===0 && <tr><td className="px-5 py-4 text-preto/40" colSpan={4}>Nenhum processo ainda.</td></tr>}
          {list.map((p)=>(<tr key={p.id} className="border-t border-preto/5"><td className="px-5 py-3 font-semibold">{p.number}</td><td>{LABEL[p.type] ?? p.type}</td><td><span className="bg-offwhite px-2 py-1 rounded-lg text-xs">{p.status}</span></td><td className="text-preto/50">{new Date(p.created_at).toLocaleString('pt-BR')}</td></tr>))}
        </tbody>
      </table>
    </div>
  </Shell>);
}
