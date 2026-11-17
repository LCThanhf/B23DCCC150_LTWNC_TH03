import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Thư viện khoa CNTT',
    template: '%s | Thư viện khoa',
  },
  description: 'Tra cứu danh mục và đăng ký mượn sách của thư viện khoa CNTT.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          <Header />

          <main className="container">{children}</main>

          <footer className="site-footer">
            <div className="container">
              Thư viện khoa CNTT · Bài thực hành Lập trình Web nâng cao
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
