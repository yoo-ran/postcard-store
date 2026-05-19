import Navbar from '@/components/layout/Navbar';
import './globals.css';
import Footer from '@/components/layout/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body data-gramm='false' data-gramm_editor='false'>
        <Navbar />
        <main className='mx-auto max-w-6xl px-4 py-8'>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
