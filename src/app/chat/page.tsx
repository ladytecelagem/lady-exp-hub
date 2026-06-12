'use client';
import { useEffect, useRef, useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';

type Channel = { id: string; name: string };
type Tr = { locale: string; content: string };
type Msg = { id: string; content_original: string; locale_original: string; sender_id: string; type: string; created_at: string; message_translations: Tr[] };
type U = { id: string; email: string };
const LANGS = [{ c: 'pt', l: 'Português' }, { c: 'en', l: 'English' }, { c: 'es', l: 'Español' }];

export default function Chat() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState(''); const [uid, setUid] = useState(''); const [view, setView] = useState('pt');
  const [showOrig, setShowOrig] = useState<Record<string, boolean>>({});
  const [users, setUsers] = useState<U[]>([]); const [members, setMembers] = useState<string[]>([]); const [showMembers, setShowMembers] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadChannels = async () => { const d = await (await fetch('/api/chat?type=channels')).json(); setChannels(d); if (!active && d[0]) setActive(d[0].id); };
  const loadMsgs = async (ch: string) => setMsgs(await (await fetch('/api/chat?type=messages&channel=' + ch)).json());
  const loadMembers = async (ch: string) => setMembers(await (await fetch('/api/chat?type=members&channel=' + ch)).json());

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id ?? ''; setUid(id);
      if (id) { const me = await (await fetch('/api/me?uid=' + id)).json(); if (me?.default_locale) setView(me.default_locale); }
    });
    loadChannels();
    fetch('/api/users').then((r) => r.json()).then(setUsers);
  }, []);

  useEffect(() => {
    if (!active) return;
    loadMsgs(active); loadMembers(active);
    // marca como lido
    const seen = JSON.parse(localStorage.getItem('lady_lastSeen') || '{}'); seen[active] = Date.now();
    localStorage.setItem('lady_lastSeen', JSON.stringify(seen));
    const t = setInterval(() => {
      loadMsgs(active);
      const s = JSON.parse(localStorage.getItem('lady_lastSeen') || '{}'); s[active] = Date.now(); localStorage.setItem('lady_lastSeen', JSON.stringify(s));
    }, 3000);
    return () => clearInterval(t);
  }, [active]);

  useEffect(() => { endRef.current?.scrollIntoView(); }, [msgs]);

  const changeView = async (v: string) => { setView(v); if (uid) fetch('/api/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, locale: v }) }); };
  const novoCanal = async () => { const name = prompt('Nome do canal:'); if (!name) return; await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'channel', name }) }); loadChannels(); };
  const enviar = async () => { if (!text.trim() || !active) return; const body = { type: 'message', channel_id: active, sender_id: uid, content: text, locale: view }; setText(''); await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); loadMsgs(active); };

  const anexar = async (file: File) => {
    if (!active) return;
    const b64: string = await new Promise((res) => { const r = new FileReader(); r.onload = () => res((r.result as string).split(',')[1]); r.readAsDataURL(file); });
    const up = await (await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: file.name, type: file.type, dataBase64: b64 }) })).json();
    if (up.url) {
      const kind = (file.type || '').startsWith('image') ? 'image' : 'file';
      await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'message', channel_id: active, sender_id: uid, content: up.url, kind }) });
      loadMsgs(active);
    }
  };

  const toggleMember = async (userId: string) => {
    const is = members.includes(userId);
    await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: is ? 'member_remove' : 'member', channel_id: active, user_id: userId }) });
    loadMembers(active!);
  };

  const render = (m: Msg) => { if (showOrig[m.id]) return m.content_original; if (m.locale_original === view) return m.content_original; return m.message_translations?.find((t) => t.locale === view)?.content ?? m.content_original; };
  const activeName = channels.find((c) => c.id === active)?.name;

  return (
    <Shell title="Chat">
      <div className="flex justify-end mb-3 items-center gap-2">
        <span className="text-xs text-muted">Seu idioma:</span>
        <select value={view} onChange={(e) => changeView(e.target.value)} className="border border-line rounded-lg px-3 py-1.5 bg-white text-sm">
          {LANGS.map((l) => <option key={l.c} value={l.c}>{l.l}</option>)}
        </select>
      </div>
      <div className="flex gap-4 h-[calc(100vh-12rem)]">
        <div className="w-60 bg-white rounded-2xl border border-line shadow-soft p-3 flex flex-col">
          <button onClick={novoCanal} className="w-full bg-ink text-white rounded-lg py-2 text-sm font-medium mb-3">+ Novo canal</button>
          <div className="space-y-1 overflow-y-auto">
            {channels.map((c) => (<button key={c.id} onClick={() => setActive(c.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${active === c.id ? 'bg-ink text-white' : 'hover:bg-paper'}`}># {c.name}</button>))}
            {channels.length === 0 && <p className="text-muted text-sm px-3">Crie o primeiro canal.</p>}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-line shadow-soft flex flex-col">
          {active && (
            <div className="px-5 py-3 border-b border-line flex items-center justify-between">
              <div className="font-medium"># {activeName}</div>
              <button onClick={() => setShowMembers((v) => !v)} className="text-sm text-muted hover:text-ink">Membros ({members.length})</button>
            </div>
          )}
          {showMembers && active && (
            <div className="px-5 py-3 border-b border-line bg-paper max-h-44 overflow-y-auto">
              <p className="text-xs text-muted mb-2">Marque quem participa deste canal:</p>
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
                  <input type="checkbox" checked={members.includes(u.id)} onChange={() => toggleMember(u.id)} />
                  {u.email}
                </label>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {msgs.map((m) => {
              const mine = m.sender_id === uid; const translated = m.type === 'text' && m.locale_original !== view && !showOrig[m.id];
              return (<div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${mine ? 'bg-ink text-white' : 'bg-paper'}`}>
                  {m.type === 'image'
                    ? <img src={m.content_original} alt="" className="rounded-lg max-h-60" />
                    : m.type === 'file'
                      ? <a href={m.content_original} target="_blank" className="underline">📎 Baixar arquivo</a>
                      : render(m)}
                  <div className={`flex items-center gap-2 text-[10px] mt-1 ${mine ? 'text-white/50' : 'text-muted'}`}>
                    <span>{new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    {m.type === 'text' && m.locale_original !== view && (<button onClick={() => setShowOrig((s) => ({ ...s, [m.id]: !s[m.id] }))} className="underline">{showOrig[m.id] ? 'ver tradução' : 'ver original'}</button>)}
                    {translated && <span className="opacity-70">• traduzido</span>}
                  </div>
                </div></div>);
            })}
            {active && msgs.length === 0 && <p className="text-muted text-sm">Sem mensagens ainda.</p>}
            <div ref={endRef} />
          </div>
          {active && (
            <div className="p-3 border-t border-line flex gap-2 items-center">
              <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && anexar(e.target.files[0])} />
              <button onClick={() => fileRef.current?.click()} className="w-10 h-10 rounded-xl border border-line hover:bg-paper text-lg" title="Anexar">📎</button>
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviar()} placeholder={`Escreva em ${LANGS.find((l) => l.c === view)?.l}...`} className="flex-1 border border-line rounded-xl px-4 py-2 outline-none focus:border-ink" />
              <button onClick={enviar} className="bg-ink text-white px-5 rounded-xl font-medium">Enviar</button>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
