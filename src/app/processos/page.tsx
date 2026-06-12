'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Proc = { id: string; number: string; type: string; status: string; created_at: string };

const TIPOS = ['sample','development','sales_order','export','production','complaint','support'];
const LABEL: Record<string,string> = {
  sample:'Amostra', development:'Desenvolvimento', sales_order:'Pedido',
  export:'Exportação', production:'Produção', complaint:'Reclamação', support:'Suporte',
};

export default function Processos() {
  const [list, setList] = useState<Proc[]>([]);
  const [tipo, setTipo] = useState('export');
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    const r = await fetch('/api/processes');
    setList(await r.json());
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login';
      else carregar();
    });
  }, []);

  const criar = async () => {
    await fetch('/api/processes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: tipo }),
    });
    carregar();
  };

  return (
    <main className="min-h-screen p-10">
      <Link href="/dashboard" className="text-sm text-acustica">← Voltar</Link>
      <h1 className="text-3xl font-bold mt-2">Processos</h1>

      <div className="mt-4 flex gap-2">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border p-2">
          {TIPOS.map((t) => <option key={t} value={t}>{LABEL[t]}</option>)}
        </select>
        <button onClick={criar} className="bg-preto text-branco px-4 py-2 font-bold">+ Novo processo</button>
      </div>

      <table className="mt-6 w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-preto">
            <th className="py-2">Número</th><th>Tipo</th><th>Status</th><th>Criado</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td className="py-3" colSpan={4}>Carregando...</td></tr>}
          {!loading && list.length === 0 && <tr><td className="py-3" colSpan={4}>Nenhum processo ainda.</td></tr>}
          {list.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2 font-bold">{p.number}</td>
              <td>{LABEL[p.type] ?? p.type}</td>
              <td>{p.status}</td>
              <td>{new Date(p.created_at).toLocaleString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
