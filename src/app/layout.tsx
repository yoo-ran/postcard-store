import Navbar from '@/components/layout/Navbar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <Navbar />
        <main className='mx-auto max-w-6xl px-4 py-8'>{children}</main>
      </body>
    </html>
  );
}
