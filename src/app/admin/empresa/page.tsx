'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
export default function Empresa() {
  const [name, setName] = useState(''); const [logo, setLogo] = useState(''); const [color, setColor] = useState('#101820'); const [msg, setMsg] = useState('');
  const carregar = async () => { const d = await (await fetch('/api/company')).json(); if (d) { setName(d.name ?? ''); setLogo(d.logo_url ?? ''); setColor(d.colors?.primary ?? '#101820'); } };
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) window.location.href='/login'; else carregar(); }); }, []);
  const salvar = async () => { setMsg(''); const r = await fetch('/api/company', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, logo_url: logo, colors: { primary: color } }) }); setMsg(r.ok ? 'Salvo ✅' : 'Erro ao salvar'); };
  return (<Shell title="Empresa">
    <div className="max-w-lg bg-white rounded-2xl border border-preto/10 p-6 space-y-4">
      <div><label className="block text-sm font-medium mb-1">Nome da empresa</label><input className="w-full border border-preto/15 rounded-xl px-3 py-2" value={name} onChange={(e)=>setName(e.target.value)} /></div>
      <div><label className="block text-sm font-medium mb-1">URL do logo</label><input className="w-full border border-preto/15 rounded-xl px-3 py-2" placeholder="https://..." value={logo} onChange={(e)=>setLogo(e.target.value)} /></div>
      <div><label className="block text-sm font-medium mb-1">Cor principal</label><input type="color" className="h-10 w-20 rounded" value={color} onChange={(e)=>setColor(e.target.value)} /></div>
      <button onClick={salvar} className="bg-preto text-white rounded-xl px-5 py-2.5 font-semibold">Salvar</button>
      {msg && <p className="text-sm text-forest">{msg}</p>}
    </div>
  </Shell>);
}
