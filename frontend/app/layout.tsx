import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ICP Classification',
  description: 'Classify websites as ICP or Not ICP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
