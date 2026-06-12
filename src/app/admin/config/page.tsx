'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
const ITEMS = [
  { key: 'chat', label: 'Chat' }, { key: 'ia', label: 'Assistente IA' },
  { key: 'processos', label: 'Processos' }, { key: 'export', label: 'Export Docs' },
  { key: 'usuarios', label: 'Usuários' }, { key: 'empresa', label: 'Empresa' },
];
export default function Config() {
  const [feat, setFeat] = useState<Record<string, boolean>>({}); const [msg, setMsg] = useState('');
  const load = async () => setFeat(await (await fetch('/api/settings')).json());
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) window.location.href = '/login'; else load(); }); }, []);
  const toggle = (k: string) => setFeat((f) => ({ ...f, [k]: f[k] === false ? true : false }));
  const salvar = async () => { const r = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ features: feat }) }); setMsg(r.ok ? 'Salvo ✅' : 'Erro'); };
  return (<Shell title="Configurações">
    <div className="max-w-xl bg-white rounded-2xl border border-line shadow-soft p-6">
      <p className="text-muted text-sm mb-5">Habilite ou desabilite módulos do menu para todos os usuários.</p>
      <div className="divide-y divide-line">
        {ITEMS.map((it) => { const on = feat[it.key] !== false;
          return (<div key={it.key} className="flex items-center justify-between py-3">
            <span className="font-medium">{it.label}</span>
            <button onClick={() => toggle(it.key)} className={`w-12 h-7 rounded-full transition relative ${on ? 'bg-forest' : 'bg-line'}`}>
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition ${on ? 'left-6' : 'left-1'}`} />
            </button>
          </div>); })}
      </div>
      <button onClick={salvar} className="mt-6 bg-ink text-white rounded-xl px-5 py-2.5 font-medium">Salvar</button>
      {msg && <span className="ml-3 text-sm text-forest">{msg}</span>}
    </div>
  </Shell>);
}
