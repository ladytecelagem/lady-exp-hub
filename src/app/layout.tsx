import './globals.css';

export const metadata = { title: 'Lady Export Hub' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `tailwind.config={theme:{extend:{colors:{
              preto:'#101820',offwhite:'#F7F6F2',rose:'#D4857D',gold:'#BD9B60',
              forest:'#1D3C34',sky:'#94A9CB',wine:'#330E23',sand:'#DBC8B6'},
              fontFamily:{sans:['Inter','system-ui','sans-serif']}}}}`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-offwhite text-preto antialiased">{children}</body>
    </html>
  );
}
