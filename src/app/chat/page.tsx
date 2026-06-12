'use client';
import { useEffect, useRef, useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';

type Channel = { id: string; name: string };
type Msg = { id: string; content_original: string; sender_id: string; created_at: string };

export default function Chat() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [uid, setUid] = useState<string>('');
  const endRef = useRef<HTMLDivElement>(null);

  const loadChannels = async () => {
    const r = await fetch('/api/chat?type=channels');
    const d = await r.json();
    setChannels(d);
    if (!active && d[0]) setActive(d[0].id);
  };
  const loadMsgs = async (ch: string) => {
    const r = await fetch('/api/chat?type=messages&channel=' + ch);
    setMsgs(await r.json());
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? ''));
    loadChannels();
  }, []);

  useEffect(() => {
    if (!active) return;
    loadMsgs(active);
    const t = setInterval(() => loadMsgs(active), 3000);
    return () => clearInterval(t);
  }, [active]);

  useEffect(() => { endRef.current?.scrollIntoView(); }, [msgs]);

  const novoCanal = async () => {
    const name = prompt('Nome do canal:');
    if (!name) return;
    await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'channel', name }) });
    loadChannels();
  };

  const enviar = async () => {
    if (!text.trim() || !active) return;
    const body = { type: 'message', channel_id: active, sender_id: uid, content: text };
    setText('');
    await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    loadMsgs(active);
  };

  return (
    <Shell title="Chat">
      <div className="flex gap-4 h-[calc(100vh-9rem)]">
        <div className="w-60 bg-white rounded-2xl border border-preto/10 p-3 flex flex-col">
          <button onClick={novoCanal} className="w-full bg-preto text-white rounded-lg py-2 text-sm font-semibold mb-3">+ Novo canal</button>
          <div className="space-y-1 overflow-y-auto">
            {channels.map((c) => (
              <button key={c.id} onClick={() => setActive(c.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${active === c.id ? 'bg-preto text-white' : 'hover:bg-offwhite'}`}>
                # {c.name}
              </button>
            ))}
            {channels.length === 0 && <p className="text-preto/40 text-sm px-3">Crie o primeiro canal.</p>}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-preto/10 flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {msgs.map((m) => {
              const mine = m.sender_id === uid;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${mine ? 'bg-preto text-white' : 'bg-offwhite'}`}>
                    {m.content_original}
                    <div className={`text-[10px] mt-1 ${mine ? 'text-white/50' : 'text-preto/40'}`}>
                      {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            {active && msgs.length === 0 && <p className="text-preto/40 text-sm">Sem mensagens ainda.</p>}
            <div ref={endRef} />
          </div>
          {active && (
            <div className="p-3 border-t border-preto/10 flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && enviar()}
                placeholder="Escreva uma mensagem..."
                className="flex-1 border border-preto/15 rounded-xl px-4 py-2 outline-none focus:border-preto" />
              <button onClick={enviar} className="bg-preto text-white px-5 rounded-xl font-semibold">Enviar</button>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
