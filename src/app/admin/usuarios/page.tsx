'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
type U = { id: string; email: string; created_at: string; blocked: boolean };
const LANGS = [{ c: 'pt', l: 'Português' }, { c: 'en', l: 'English' }, { c: 'es', l: 'Español' }];
export default function Usuarios() {
  const [list, setList] = useState<U[]>([]);
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [locale, setLocale] = useState('pt');
  const [msg, setMsg] = useState(''); const [loading, setLoading] = useState(true);
  const carregar = async () => { setList(await (await fetch('/api/users')).json()); setLoading(false); };
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) window.location.href = '/login'; else carregar(); }); }, []);
  const criar = async () => { setMsg(''); const d = await (await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pw, locale }) })).json(); if (d.error) setMsg(d.error); else { setEmail(''); setPw(''); carregar(); } };
  const toggle = async (u: U) => { await fetch('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, block: !u.blocked }) }); carregar(); };
  return (<Shell title="Usuários">
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl border border-line shadow-soft p-5 h-fit">
        <h3 className="font-semibold mb-4">Cadastrar usuário</h3>
        <input className="w-full border border-line rounded-xl px-3 py-2 mb-3" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border border-line rounded-xl px-3 py-2 mb-3" placeholder="senha" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <label className="block text-sm font-medium mb-1">Idioma padrão</label>
        <select className="w-full border border-line rounded-xl px-3 py-2 mb-4 bg-white" value={locale} onChange={(e) => setLocale(e.target.value)}>{LANGS.map((l) => <option key={l.c} value={l.c}>{l.l}</option>)}</select>
        <button onClick={criar} className="w-full bg-ink text-white rounded-xl py-2 font-medium">Criar</button>
        {msg && <p className="text-rose text-sm mt-3">{msg}</p>}
      </div>
      <div className="lg:col-span-2 bg-white rounded-2xl border border-line shadow-soft overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-muted"><tr><th className="px-5 py-3">Email</th><th>Status</th><th className="text-right pr-5">Ação</th></tr></thead>
          <tbody>
            {loading && <tr><td className="px-5 py-4" colSpan={3}>Carregando...</td></tr>}
            {list.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-5 py-3 font-medium">{u.email}</td>
                <td>{u.blocked ? <span className="text-rose">Desabilitado</span> : <span className="text-forest">Ativo</span>}</td>
                <td className="text-right pr-5">
                  <button onClick={() => toggle(u)} className={`text-xs rounded-lg px-3 py-1.5 ${u.blocked ? 'bg-forest text-white' : 'border border-line'}`}>{u.blocked ? 'Habilitar' : 'Desabilitar'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </Shell>);
}
