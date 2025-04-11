// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import Header from '@/components/Header';

import ClientSessionProvider from './ClientSessionProvider';

export const metadata = {
  title: 'SMB Back Office',
  description: 'Site inspiré de l\'identité visuelle de la Sécurité Routière.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="flex flex-col min-h-screen">
        <ClientSessionProvider>
          <Header />
          <div className="flex-grow md:ml-64"> {/* Add left margin for desktop to account for sidebar */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-24 md:pt-8">{children}</main>
          </div>
          <div className="md:ml-64"> {/* Add left margin for desktop to account for sidebar */}

          </div>
        </ClientSessionProvider>
      </body>
    </html>
  );
}