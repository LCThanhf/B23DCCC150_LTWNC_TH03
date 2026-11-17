import type { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES } from '@/data/books';
import { loadBooksShift } from '@/lib/books';
import { clockTime } from '@/lib/clock';

export const metadata: Metadata = {
  title: 'Danh mục sách',
  description: 'Tra cứu danh mục sách của thư viện khoa CNTT theo tên và chuyên mục.',
};

interface BooksPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const { q = '', category = '' } = await searchParams;
  const books = await loadBooksShift({ q, category });
  const renderedAt = clockTime();

  return (
    <section>
      <h1>Danh mục sách</h1>
      <p className="lead">
        Lọc sách theo tên và chuyên mục. Kết quả được render mới mỗi lần tải
        trang (SSR).
      </p>

      <form className="panel filter-form" method="get" action="/books">
        <div className="field">
          <label htmlFor="q">Tìm sách</label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="Nhập tên sách..."
            defaultValue={q}
          />
        </div>

        <div className="field">
          <label htmlFor="category">Chuyên mục</label>
          <select id="category" name="category" defaultValue={category}>
            <option value="">Tất cả</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <button className="btn" type="submit">
          Lọc
        </button>
      </form>

      <p className="muted">Tìm thấy {books.length} sách</p>
      <p className="muted small">Render lúc: {renderedAt}</p>

      {books.length === 0 ? (
        <p className="empty">Không tìm thấy sách nào.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Tên sách</th>
                <th scope="col">Tác giả</th>
                <th scope="col">Số bản</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>
                    <Link className="book-link" href={`/books/${book.id}`}>
                      {book.title}
                    </Link>
                  </td>
                  <td className="muted">{book.author}</td>
                  <td>Số bản: {book.copies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
