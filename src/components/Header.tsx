'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/">
          Thư viện khoa CNTT
        </Link>

        <nav className="nav" aria-label="Điều hướng chính">
          <Link href="/">Trang chủ</Link>
          <Link href="/books">Sách</Link>

          {user ? (
            <>
              <Link href="/loans">Sách đã mượn</Link>
              {user.role === 'admin' ? <Link href="/admin">Quản trị</Link> : null}
              <span className="nav-user">
                Xin chào, {user.name} ({user.role})
              </span>
              <button
                className="nav-button"
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Đăng xuất
              </button>
            </>
          ) : status === 'loading' ? null : (
            <Link href="/login">Đăng nhập</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
