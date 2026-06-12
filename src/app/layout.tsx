import './globals.css';
export const metadata = { title: 'Lady Export Hub' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: `tailwind.config={theme:{extend:{colors:{
          ink:'#16181D',paper:'#FAFAF8',line:'#ECEAE4',muted:'#8C8980',
          preto:'#16181D',offwhite:'#FAFAF8',
          rose:'#D4857D',gold:'#BD9B60',forest:'#1D3C34',sky:'#94A9CB',wine:'#330E23',sand:'#DBC8B6'},
          fontFamily:{sans:['Manrope','system-ui','sans-serif']},
          borderRadius:{xl:'0.9rem','2xl':'1.1rem'},
          boxShadow:{soft:'0 1px 2px rgba(16,18,24,.04),0 8px 24px rgba(16,18,24,.05)'}}}}` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
