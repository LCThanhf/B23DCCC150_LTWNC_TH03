import Link from 'next/link';

export default function BookNotFound() {
  return (
    <section>
      <p className="badge">404</p>
      <h1>Không tìm thấy sách</h1>
      <p className="lead">
        Đầu sách bạn tìm không tồn tại hoặc đã bị xoá khỏi danh mục.
      </p>
      <Link className="btn btn-ghost" href="/books">
        Về danh mục sách
      </Link>
    </section>
  );
}
