import './globals.css';
import { ReactNode } from 'react';
import Header from '@/components/Header';


export const metadata = {
  title: 'SMB Back Office',
  description: 'Site inspiré de l’identité visuelle de la Sécurité Routière.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>

      </body>
    </html>
  );
}
