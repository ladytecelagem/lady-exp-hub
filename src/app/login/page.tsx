'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
export default function Login() {
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [msg, setMsg] = useState(''); const [loading, setLoading] = useState(false);
  const signIn = async () => { setLoading(true); setMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw }); setLoading(false);
    if (error) setMsg(error.message); else window.location.href = '/dashboard'; };
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-preto text-white p-12">
        <div className="text-3xl font-extrabold tracking-[0.25em]">LADY</div>
        <div><h2 className="text-4xl font-bold leading-tight">Export Hub</h2>
          <p className="mt-4 text-white/60 max-w-sm">O centro operacional global da Lady — comunicação, processos e exportação em um só lugar.</p></div>
        <div className="text-white/40 text-sm">© Lady Group</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-1">Bem-vindo</h1>
          <p className="text-preto/50 mb-8 text-sm">Entre para continuar</p>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input className="w-full border border-preto/15 rounded-xl px-4 py-3 mb-4 outline-none focus:border-preto" placeholder="voce@lady.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input type="password" className="w-full border border-preto/15 rounded-xl px-4 py-3 mb-6 outline-none focus:border-preto" placeholder="••••••••" value={pw} onChange={(e)=>setPw(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&signIn()} />
          <button onClick={signIn} disabled={loading} className="w-full bg-preto text-white rounded-xl py-3 font-semibold hover:opacity-90 disabled:opacity-50">{loading?'Entrando...':'Entrar'}</button>
          {msg && <p className="text-rose mt-4 text-sm">{msg}</p>}
        </div>
      </div>
    </main>
  );
}
