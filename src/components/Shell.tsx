'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const NAV = [
  { href: '/dashboard', label: 'Início', key: 'dashboard' },
  { href: '/chat', label: 'Chat', key: 'chat' },
  { href: '/ia', label: 'Assistente IA', key: 'ia' },
  { href: '/processos', label: 'Processos', key: 'processos' },
  { href: '/export', label: 'Export Docs', key: 'export' },
  { href: '/admin/usuarios', label: 'Usuários', key: 'usuarios' },
  { href: '/admin/empresa', label: 'Empresa', key: 'empresa' },
  { href: '/admin/config', label: 'Configurações', key: 'config' },
];

export default function Shell({ children, title }: { children: React.ReactNode; title: string }) {
  const [email, setEmail] = useState<string | null>(null);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [unread, setUnread] = useState(0);
  const prev = useRef(0);
  const path = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login'; else setEmail(data.user.email ?? null);
    });
    fetch('/api/settings').then((r) => r.json()).then((d) => setFeatures(d || {}));
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }, []);

  // badge de novas mensagens (compara com últimas vistas, salvas localmente)
  useEffect(() => {
    const tick = async () => {
      try {
        const latest = await (await fetch('/api/chat?type=latest')).json();
        const seen = JSON.parse(localStorage.getItem('lady_lastSeen') || '{}');
        let n = 0;
        for (const ch in latest) if (new Date(latest[ch]).getTime() > (seen[ch] || 0)) n++;
        setUnread(n);
        if (n > prev.current && 'Notification' in window && Notification.permission === 'granted')
          new Notification('Lady Export Hub', { body: 'Você tem novas mensagens' });
        prev.current = n;
      } catch {}
    };
    tick(); const t = setInterval(tick, 6000); return () => clearInterval(t);
  }, []);

  const sair = async () => { await supabase.auth.signOut(); window.location.href = '/login'; };
  const initials = (email || '?').slice(0, 2).toUpperCase();
  const visible = NAV.filter((n) => features[n.key] !== false);

  return (
    <div className="min-h-screen flex">
      <aside className="w-[244px] bg-ink text-white/90 flex flex-col fixed h-screen">
        <div className="px-6 pt-7 pb-6 text-xl font-semibold tracking-[0.3em]">LADY</div>
        <nav className="flex-1 px-3 space-y-0.5">
          {visible.map((n) => {
            const on = path === n.href;
            return (
              <Link key={n.href} href={n.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] transition ${on ? 'bg-white/10 text-white' : 'text-white/55 hover:text-white hover:bg-white/[0.06]'}`}>
                <span className="flex items-center gap-2.5">
                  <span className={`w-1 h-4 rounded-full ${on ? 'bg-rose' : 'bg-transparent'}`} />
                  {n.label}
                </span>
                {n.key === 'chat' && unread > 0 && (
                  <span className="bg-rose text-ink text-[10px] font-bold rounded-full px-1.5 min-w-[18px] text-center">{unread}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center text-xs font-semibold">{initials}</div>
            <div className="text-[12px] text-white/55 truncate">{email ?? '...'}</div>
          </div>
          <button onClick={sair} className="w-full bg-white/[0.06] hover:bg-white/10 rounded-lg py-2 text-[13px] font-medium">Sair</button>
        </div>
      </aside>
      <main className="flex-1 ml-[244px] px-10 py-9">
        <h1 className="text-[26px] font-semibold mb-7">{title}</h1>
        {children}
      </main>
    </div>
  );
}
