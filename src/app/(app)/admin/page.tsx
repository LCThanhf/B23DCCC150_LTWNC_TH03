import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { TERM_LABEL, formatDate } from '@/lib/format';
import { can } from '@/lib/permissions';
import { reviewLoan } from './actions';

export const metadata: Metadata = {
  title: 'Duyệt yêu cầu mượn',
  robots: { index: false },
};

export default async function AdminPage() {
  // Kiểm tra lại quyền ngay trong trang, phòng khi proxy bị cấu hình sai.
  const session = await auth();

  if (!can(session?.user.role, 'loan:review')) {
    redirect('/forbidden');
  }

  const pendingLoans = db.loans.filter((loan) => loan.status === 'pending');
  const approvedCount = db.loans.filter(
    (loan) => loan.status === 'approved',
  ).length;
  const rejectedCount = db.loans.filter(
    (loan) => loan.status === 'rejected',
  ).length;

  return (
    <section>
      <h1>Duyệt yêu cầu mượn</h1>

      <p className="muted">
        Chờ duyệt: <strong>{pendingLoans.length}</strong> | Đã duyệt:{' '}
        <strong>{approvedCount}</strong> | Từ chối:{' '}
        <strong>{rejectedCount}</strong>
      </p>

      {pendingLoans.length === 0 ? (
        <p className="empty">Không có yêu cầu nào đang chờ duyệt.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Tên sách</th>
                <th scope="col">Ngày lấy</th>
                <th scope="col">Thời hạn</th>
                <th scope="col">Người mượn</th>
                <th scope="col">Xử lý</th>
              </tr>
            </thead>
            <tbody>
              {pendingLoans.map((loan) => {
                const book = db.books.find((item) => item.id === loan.bookId);

                return (
                  <tr key={loan.id}>
                    <td className="book-link">{book?.title ?? '—'}</td>
                    <td>{formatDate(loan.pickupDate)}</td>
                    <td>{TERM_LABEL[loan.term]}</td>
                    <td className="muted">{loan.userEmail}</td>
                    <td>
                      <div className="row-actions">
                        <form action={reviewLoan.bind(null, loan.id, 'approved')}>
                          <button className="btn btn-sm" type="submit">
                            Duyệt
                          </button>
                        </form>
                        <form action={reviewLoan.bind(null, loan.id, 'rejected')}>
                          <button
                            className="btn btn-sm btn-ghost"
                            type="submit"
                          >
                            Từ chối
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
