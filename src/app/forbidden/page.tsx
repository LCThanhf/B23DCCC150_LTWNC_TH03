import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Không có quyền truy cập',
  robots: { index: false },
};

export default function ForbiddenPage() {
  return (
    <section>
      <p className="badge">403</p>
      <h1>Bạn không có quyền truy cập trang này</h1>
      <p className="lead">
        Tài khoản hiện tại không được phép xem nội dung này. Hãy quay về trang
        chủ hoặc đăng nhập bằng tài khoản khác.
      </p>
      <Link className="btn btn-ghost" href="/">
        Về trang chủ
      </Link>
    </section>
  );
}
