import Link from 'next/link';
import { CATEGORIES } from '@/data/books';
import { db } from '@/lib/db';

export default function HomePage() {
  const totalBooks = db.books.length;
  const totalCategories = CATEGORIES.length;

  return (
    <section>
      <h1>Thư viện khoa CNTT PTIT</h1>
      <p className="lead">
        {totalBooks} đầu sách · {totalCategories} chuyên mục
      </p>
      <p className="muted">
        Tra cứu sách theo chuyên mục, xem chi tiết từng đầu sách và đăng ký mượn
        trực tuyến. Mỗi đầu sách chỉ có vài bản, hệ thống kiểm tra tồn kho theo
        ngày lấy sách trước khi duyệt.
      </p>

      <div className="stats">
        <Link className="btn" href="/books">
          Xem danh mục sách
        </Link>
      </div>
    </section>
  );
}
