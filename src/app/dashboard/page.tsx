'use client';
import Link from 'next/link';
import Shell from '@/components/Shell';

const CARDS = [
  { href: '/chat', title: 'Chat', desc: 'Comunicação global em tempo real', color: 'bg-wine' },
  { href: '/processos', title: 'Processos', desc: 'Amostras, pedidos, exportação', color: 'bg-forest' },
  { href: '/admin/usuarios', title: 'Usuários', desc: 'Cadastro e permissões', color: 'bg-preto' },
];

export default function Dashboard() {
  return (
    <Shell title="Início">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href}
            className="group rounded-2xl border border-preto/10 bg-white p-6 hover:shadow-lg transition">
            <div className={`${c.color} w-10 h-10 rounded-xl mb-4`} />
            <div className="font-bold text-lg">{c.title}</div>
            <div className="text-preto/50 text-sm mt-1">{c.desc}</div>
          </Link>
        ))}
        <div className="rounded-2xl border border-dashed border-preto/15 p-6 flex items-center justify-center text-preto/40 text-sm">
          Export Docs · IA — em breve
        </div>
      </div>
    </Shell>
  );
}
