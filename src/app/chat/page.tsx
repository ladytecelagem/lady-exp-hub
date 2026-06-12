'use client';
import { useEffect, useRef, useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
type Channel = { id: string; name: string };
type Tr = { locale: string; content: string };
type Msg = { id: string; content_original: string; locale_original: string; sender_id: string; created_at: string; message_translations: Tr[] };
const LANGS = [{ c: 'pt', l: 'Português' }, { c: 'en', l: 'English' }, { c: 'es', l: 'Español' }];
export default function Chat() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState(''); const [uid, setUid] = useState(''); const [view, setView] = useState('pt');
  const [showOrig, setShowOrig] = useState<Record<string, boolean>>({});
  const endRef = useRef<HTMLDivElement>(null);
  const loadChannels = async () => { const d = await (await fetch('/api/chat?type=channels')).json(); setChannels(d); if (!active && d[0]) setActive(d[0].id); };
  const loadMsgs = async (ch: string) => setMsgs(await (await fetch('/api/chat?type=messages&channel=' + ch)).json());
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id ?? ''; setUid(id);
      if (id) { const me = await (await fetch('/api/me?uid=' + id)).json(); if (me?.default_locale) setView(me.default_locale); }
    });
    loadChannels();
  }, []);
  useEffect(() => { if (!active) return; loadMsgs(active); const t = setInterval(() => loadMsgs(active), 3000); return () => clearInterval(t); }, [active]);
  useEffect(() => { endRef.current?.scrollIntoView(); }, [msgs]);
  const changeView = async (v: string) => {
    setView(v);
    if (uid) fetch('/api/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, locale: v }) });
  };
  const novoCanal = async () => { const name = prompt('Nome do canal:'); if (!name) return; await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'channel', name }) }); loadChannels(); };
  const enviar = async () => { if (!text.trim() || !active) return; const body = { type: 'message', channel_id: active, sender_id: uid, content: text, locale: view }; setText(''); await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); loadMsgs(active); };
  const render = (m: Msg) => { if (showOrig[m.id]) return m.content_original; if (m.locale_original === view) return m.content_original; return m.message_translations?.find((t) => t.locale === view)?.content ?? m.content_original; };
  return (
    <Shell title="Chat">
      <div className="flex justify-end mb-3 items-center gap-2">
        <span className="text-xs text-preto/40">Seu idioma:</span>
        <select value={view} onChange={(e) => changeView(e.target.value)} className="border border-preto/15 rounded-lg px-3 py-1.5 bg-white text-sm">
          {LANGS.map((l) => <option key={l.c} value={l.c}>{l.l}</option>)}
        </select>
      </div>
      <div className="flex gap-4 h-[calc(100vh-11rem)]">
        <div className="w-60 bg-white rounded-2xl border border-preto/10 p-3 flex flex-col">
          <button onClick={novoCanal} className="w-full bg-preto text-white rounded-lg py-2 text-sm font-semibold mb-3">+ Novo canal</button>
          <div className="space-y-1 overflow-y-auto">
            {channels.map((c) => (<button key={c.id} onClick={() => setActive(c.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${active===c.id?'bg-preto text-white':'hover:bg-offwhite'}`}># {c.name}</button>))}
            {channels.length === 0 && <p className="text-preto/40 text-sm px-3">Crie o primeiro canal.</p>}
          </div>
        </div>
        <div className="flex-1 bg-white rounded-2xl border border-preto/10 flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {msgs.map((m) => { const mine = m.sender_id === uid; const translated = m.locale_original !== view && !showOrig[m.id];
              return (<div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${mine ? 'bg-preto text-white' : 'bg-offwhite'}`}>
                  {render(m)}
                  <div className={`flex items-center gap-2 text-[10px] mt-1 ${mine ? 'text-white/50' : 'text-preto/40'}`}>
                    <span>{new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    {m.locale_original !== view && (<button onClick={() => setShowOrig((s) => ({ ...s, [m.id]: !s[m.id] }))} className="underline">{showOrig[m.id] ? 'ver tradução' : 'ver original'}</button>)}
                    {translated && <span className="opacity-70">• traduzido</span>}
                  </div>
                </div></div>); })}
            {active && msgs.length === 0 && <p className="text-preto/40 text-sm">Sem mensagens ainda.</p>}
            <div ref={endRef} />
          </div>
          {active && (<div className="p-3 border-t border-preto/10 flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviar()} placeholder={`Escreva em ${LANGS.find(l=>l.c===view)?.l}...`} className="flex-1 border border-preto/15 rounded-xl px-4 py-2 outline-none focus:border-preto" />
            <button onClick={enviar} className="bg-preto text-white px-5 rounded-xl font-semibold">Enviar</button>
          </div>)}
        </div>
      </div>
    </Shell>
  );
}
