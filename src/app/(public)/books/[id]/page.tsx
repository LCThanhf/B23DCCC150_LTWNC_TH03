import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getBookById } from '@/lib/books';
import { clockTime } from '@/lib/clock';

export const revalidate = 60;

interface BookDetailProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return db.books.slice(0, 12).map((book) => ({ id: String(book.id) }));
}

export async function generateMetadata({
  params,
}: BookDetailProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(Number(id));

  if (!book) {
    return { title: 'Không tìm thấy sách' };
  }

  return {
    title: `${book.title} – ${book.author}`,
    description: `Sách ${book.category}, thư viện có ${book.copies} bản.`,
  };
}

export default async function BookDetailPage({ params }: BookDetailProps) {
  const { id } = await params;
  const book = await getBookById(Number(id));

  if (!book) {
    notFound();
  }

  const updatedAt = clockTime();

  return (
    <section>
      <Link className="back-link" href="/books">
        ← Danh mục sách
      </Link>

      <div className="detail">
        <h1>{book.title}</h1>

        <p className="meta-line">
          Tác giả: <strong>{book.author}</strong>
        </p>
        <p className="meta-line">
          Chuyên mục: <strong>{book.category}</strong>
        </p>
        <p className="meta-line">
          Số bản: <strong>{book.copies}</strong>
        </p>

        <p className="muted small">Cập nhật lúc: {updatedAt}</p>

        <Link className="btn" href={`/loans?book=${book.id}`}>
          Mượn sách này
        </Link>
      </div>
    </section>
  );
}
