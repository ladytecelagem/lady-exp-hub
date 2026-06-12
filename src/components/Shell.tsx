'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const NAV = [
  { href: '/dashboard', label: 'Início' },
  { href: '/chat', label: 'Chat' },
  { href: '/processos', label: 'Processos' },
  { href: '/admin/usuarios', label: 'Usuários' },
];

export default function Shell({ children, title }: { children: React.ReactNode; title: string }) {
  const [email, setEmail] = useState<string | null>(null);
  const path = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login';
      else setEmail(data.user.email ?? null);
    });
  }, []);

  const sair = async () => { await supabase.auth.signOut(); window.location.href = '/login'; };

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-preto text-white flex flex-col fixed h-screen">
        <div className="px-6 py-6 text-2xl font-extrabold tracking-[0.25em]">LADY</div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                path === n.href ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10'}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="text-xs text-white/50 truncate mb-2">{email ?? '...'}</div>
          <button onClick={sair} className="w-full bg-white/10 hover:bg-white/20 rounded-lg py-2 text-sm font-semibold">Sair</button>
        </div>
      </aside>
      <main className="flex-1 ml-60 p-8">
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        {children}
      </main>
    </div>
  );
}
