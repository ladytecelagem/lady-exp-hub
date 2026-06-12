'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login';
      else setEmail(data.user.email ?? null);
    });
  }, []);

  const sair = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <main className="min-h-screen p-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">LADY EXPORT HUB</h1>
        <button onClick={sair} className="bg-preto text-branco px-4 py-2 text-sm font-bold">Sair</button>
      </div>
      <p className="mt-2 text-acustica">Logado como {email ?? '...'}</p>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/processos" className="border border-preto p-6 font-bold hover:bg-preto hover:text-branco">Processos</Link>
        <div className="border p-6 opacity-40">Chat (em breve)</div>
        <div className="border p-6 opacity-40">Export Docs (em breve)</div>
        <div className="border p-6 opacity-40">IA (em breve)</div>
      </div>
    </main>
  );
}
