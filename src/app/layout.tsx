// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import Header from '@/components/Header';
import ClientSessionProvider from './ClientSessionProvider'; // Nouveau composant client

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
        <ClientSessionProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        </ClientSessionProvider>
      </body>
    </html>
  );
}