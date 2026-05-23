import Navbar from '@/components/layout/Navbar';
import './globals.css';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/Provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className='mx-auto max-w-6xl px-4 py-8'>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
