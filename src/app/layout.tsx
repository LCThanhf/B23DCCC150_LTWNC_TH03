import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

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
        <header className="site-header">
          <div className="container header-inner">
            <Link className="brand" href="/">
              Thư viện khoa CNTT
            </Link>
            <nav className="nav" aria-label="Điều hướng chính">
              <Link href="/">Trang chủ</Link>
              <Link href="/books">Sách</Link>
            </nav>
          </div>
        </header>

        <main className="container">{children}</main>

        <footer className="site-footer">
          <div className="container">
            Thư viện khoa CNTT · Bài thực hành Lập trình Web nâng cao
          </div>
        </footer>
      </body>
    </html>
  );
}
