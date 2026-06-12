'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
type Item = { desc: string; qty: number; price: number };
export default function ExportDocs() {
  const [cliente, setCliente] = useState(''); const [pais, setPais] = useState('');
  const [incoterm, setIncoterm] = useState('FOB'); const [moeda, setMoeda] = useState('USD');
  const [invoiceNo, setInvoiceNo] = useState('INV-0001');
  const [items, setItems] = useState<Item[]>([{ desc: '', qty: 1, price: 0 }]);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) window.location.href = '/login'; }); }, []);
  const setItem = (i: number, k: keyof Item, v: string) => setItems((arr) => arr.map((it, idx) => idx === i ? { ...it, [k]: k === 'desc' ? v : Number(v) } : it));
  const addItem = () => setItems((a) => [...a, { desc: '', qty: 1, price: 0 }]);
  const total = items.reduce((s, it) => s + it.qty * it.price, 0);
  return (<Shell title="Export Docs — Commercial Invoice">
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-preto/10 p-5 space-y-3 no-print">
        <div className="grid grid-cols-2 gap-3">
          <input className="border border-preto/15 rounded-xl px-3 py-2" placeholder="Invoice Nº" value={invoiceNo} onChange={(e)=>setInvoiceNo(e.target.value)} />
          <input className="border border-preto/15 rounded-xl px-3 py-2" placeholder="Incoterm" value={incoterm} onChange={(e)=>setIncoterm(e.target.value)} />
          <input className="border border-preto/15 rounded-xl px-3 py-2" placeholder="Cliente" value={cliente} onChange={(e)=>setCliente(e.target.value)} />
          <input className="border border-preto/15 rounded-xl px-3 py-2" placeholder="País" value={pais} onChange={(e)=>setPais(e.target.value)} />
          <input className="border border-preto/15 rounded-xl px-3 py-2" placeholder="Moeda" value={moeda} onChange={(e)=>setMoeda(e.target.value)} />
        </div>
        <div className="space-y-2">
          {items.map((it, i) => (<div key={i} className="grid grid-cols-6 gap-2">
            <input className="col-span-3 border border-preto/15 rounded-lg px-2 py-1.5 text-sm" placeholder="Descrição" value={it.desc} onChange={(e)=>setItem(i,'desc',e.target.value)} />
            <input type="number" className="border border-preto/15 rounded-lg px-2 py-1.5 text-sm" placeholder="Qtd" value={it.qty} onChange={(e)=>setItem(i,'qty',e.target.value)} />
            <input type="number" className="col-span-2 border border-preto/15 rounded-lg px-2 py-1.5 text-sm" placeholder="Preço unit." value={it.price} onChange={(e)=>setItem(i,'price',e.target.value)} />
          </div>))}
          <button onClick={addItem} className="text-sm text-preto/60 underline">+ adicionar item</button>
        </div>
        <button onClick={() => window.print()} className="w-full bg-preto text-white rounded-xl py-2.5 font-semibold">Imprimir / Salvar PDF</button>
      </div>
      <div className="bg-white rounded-2xl border border-preto/10 p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="text-2xl font-extrabold tracking-[0.2em]">LADY</div>
          <div className="text-right text-sm"><div className="font-bold">COMMERCIAL INVOICE</div><div className="text-preto/50">{invoiceNo}</div></div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div><div className="text-preto/40">Cliente</div><div className="font-medium">{cliente || '—'}</div></div>
          <div><div className="text-preto/40">País</div><div className="font-medium">{pais || '—'}</div></div>
          <div><div className="text-preto/40">Incoterm</div><div className="font-medium">{incoterm}</div></div>
          <div><div className="text-preto/40">Moeda</div><div className="font-medium">{moeda}</div></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-preto/20 text-left text-preto/50"><th className="py-2">Descrição</th><th>Qtd</th><th className="text-right">Unit.</th><th className="text-right">Total</th></tr></thead>
          <tbody>{items.map((it, i) => (<tr key={i} className="border-b border-preto/5"><td className="py-2">{it.desc || '—'}</td><td>{it.qty}</td><td className="text-right">{it.price.toFixed(2)}</td><td className="text-right">{(it.qty*it.price).toFixed(2)}</td></tr>))}</tbody>
        </table>
        <div className="flex justify-end mt-4"><div className="text-right"><div className="text-preto/40 text-sm">TOTAL ({moeda})</div><div className="text-2xl font-bold">{total.toFixed(2)}</div></div></div>
      </div>
    </div>
  </Shell>);
}
