import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Procuros tinder',
  description: 'Classify websites as ICP or Not ICP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/qlc7wiy.css" />
        <link rel="icon" href="/procuros-logo.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
