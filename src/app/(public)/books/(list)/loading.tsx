export default function BooksLoading() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      Đang tải danh mục sách...
    </div>
  );
}
