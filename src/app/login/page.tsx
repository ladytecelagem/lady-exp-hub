'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setMsg(error.message);
    else window.location.href = '/dashboard';
  };

  return (
    <main className="min-h-screen grid place-items-center bg-preto text-branco font-silka">
      <div className="w-80 space-y-3">
        <h1 className="text-3xl font-bold tracking-widest">LADY</h1>
        <input className="w-full p-2 text-preto" placeholder="email"
               value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full p-2 text-preto" type="password" placeholder="senha"
               value={pw} onChange={(e) => setPw(e.target.value)} />
        <button onClick={signIn} className="w-full bg-acustica-accent text-preto p-2 font-bold">Entrar</button>
        {msg && <p className="text-acustica-accent text-sm">{msg}</p>}
      </div>
    </main>
  );
}
