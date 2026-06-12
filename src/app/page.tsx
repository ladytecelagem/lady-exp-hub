import Link from 'next/link';
export default function Home() {
  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold">LADY EXPORT HUB</h1>
      <p className="mt-2 text-acustica">Online ✅</p>
      <Link href="/login" className="inline-block mt-6 bg-preto text-branco px-5 py-2 font-bold">Entrar</Link>
    </main>
  );
}
