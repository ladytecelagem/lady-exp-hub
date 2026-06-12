'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';

type U = { id: string; email: string; created_at: string };

export default function Usuarios() {
  const [list, setList] = useState<U[]>([]);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const carregar = async () => { const r = await fetch('/api/users'); setList(await r.json()); setLoading(false); };
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) window.location.href='/login'; else carregar(); }); }, []);

  const criar = async () => {
    setMsg('');
    const r = await fetch('/api/users', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password: pw }) });
    const d = await r.json();
    if (d.error) setMsg(d.error);
    else { setEmail(''); setPw(''); carregar(); }
  };

  return (
    <Shell title="Usuários">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-preto/10 p-5 h-fit">
          <h3 className="font-bold mb-4">Cadastrar usuário</h3>
          <input className="w-full border border-preto/15 rounded-xl px-3 py-2 mb-3" placeholder="email"
                 value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="w-full border border-preto/15 rounded-xl px-3 py-2 mb-4" placeholder="senha" type="password"
                 value={pw} onChange={(e)=>setPw(e.target.value)} />
          <button onClick={criar} className="w-full bg-preto text-white rounded-xl py-2 font-semibold">Criar</button>
          {msg && <p className="text-rose text-sm mt-3">{msg}</p>}
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-preto/10 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-offwhite text-preto/60"><tr><th className="px-5 py-3">Email</th><th>Criado</th></tr></thead>
            <tbody>
              {loading && <tr><td className="px-5 py-4" colSpan={2}>Carregando...</td></tr>}
              {list.map((u)=>(
                <tr key={u.id} className="border-t border-preto/5">
                  <td className="px-5 py-3 font-medium">{u.email}</td>
                  <td className="text-preto/50">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
