import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { LoanForm } from '@/components/LoanForm';
import { db } from '@/lib/db';
import { STATUS_LABEL, TERM_LABEL, formatDate } from '@/lib/format';
import { listLoans, parseStatus } from '@/lib/loans';
import { can } from '@/lib/permissions';
import { cancelLoanAction, createLoanAction } from './actions';

export const metadata: Metadata = {
  title: 'Sách đã mượn',
  robots: { index: false },
};

interface LoansPageProps {
  searchParams: Promise<{ status?: string; page?: string; book?: string }>;
}

const buildPageHref = (status: string, page: number): string => {
  const params = new URLSearchParams();
  if (status !== '') params.set('status', status);
  params.set('page', String(page));
  return `/loans?${params.toString()}`;
};

export default async function LoansPage({ searchParams }: LoansPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=%2Floans');
  }

  const params = await searchParams;
  const status = parseStatus(params.status);
  const pageParam = Number(params.page ?? '1');

  const viewer = {
    email: session.user.email ?? '',
    role: session.user.role,
  };

  const { items, page, totalPages } = listLoans(viewer, status, pageParam);
  const isStudent = can(session.user.role, 'loan:create');

  const bookParam = Number(params.book);
  const defaultBookId =
    Number.isInteger(bookParam) &&
    db.books.some((book) => book.id === bookParam)
      ? bookParam
      : undefined;

  return (
    <section>
      <h1>Sách đã mượn</h1>

      {isStudent ? (
        <>
          <h2>Đăng ký mượn sách</h2>
          <LoanForm
            books={db.books}
            defaultBookId={defaultBookId}
            action={createLoanAction}
          />
        </>
      ) : null}

      <form className="panel filter-form" method="get" action="/loans">
        <div className="field">
          <label htmlFor="status">Trạng thái</label>
          <select id="status" name="status" defaultValue={status}>
            <option value="">Tất cả</option>
            <option value="pending">{STATUS_LABEL.pending}</option>
            <option value="approved">{STATUS_LABEL.approved}</option>
            <option value="rejected">{STATUS_LABEL.rejected}</option>
          </select>
        </div>

        <button className="btn" type="submit">
          Lọc
        </button>
      </form>

      {items.length === 0 ? (
        <p className="empty">Chưa có yêu cầu mượn nào.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Tên sách</th>
                <th scope="col">Ngày lấy</th>
                <th scope="col">Thời hạn</th>
                <th scope="col">Số quyển</th>
                <th scope="col">Trạng thái</th>
                {isStudent ? (
                  <th scope="col">
                    <span className="visually-hidden">Hủy</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {items.map((loan) => (
                <tr key={loan.id}>
                  <td className="book-link">{loan.bookTitle}</td>
                  <td>{formatDate(loan.pickupDate)}</td>
                  <td>{TERM_LABEL[loan.term]}</td>
                  <td>{loan.quantity} quyển</td>
                  <td>
                    <span className={`status status-${loan.status}`}>
                      {STATUS_LABEL[loan.status]}
                    </span>
                  </td>
                  {isStudent ? (
                    <td>
                      {loan.status === 'pending' &&
                      loan.userEmail === session.user.email ? (
                        <form action={cancelLoanAction.bind(null, loan.id)}>
                          <button className="btn btn-sm btn-ghost" type="submit">
                            Hủy
                          </button>
                        </form>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <nav className="pager" aria-label="Phân trang">
        {page > 1 ? (
          <Link href={buildPageHref(status, page - 1)}>Trước</Link>
        ) : (
          <span className="pager-disabled">Trước</span>
        )}
        <span>
          Trang {page}/{totalPages}
        </span>
        {page < totalPages ? (
          <Link href={buildPageHref(status, page + 1)}>Sau</Link>
        ) : (
          <span className="pager-disabled">Sau</span>
        )}
      </nav>
    </section>
  );
}
