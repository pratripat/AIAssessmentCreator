import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import DashboardShell from '@/components/DashboardShell';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VedaAI',
  description: 'AI Assessment Creator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DashboardShell>
            {children}
          </DashboardShell>
        </ThemeProvider>
      </body>
    </html>
  );
}