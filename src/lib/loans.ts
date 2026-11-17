import { db } from './db';
import { can } from './permissions';
import type { LoanData } from './loan-validate';
import type { Loan, LoanStatus, Role } from '@/types';

export interface LoanViewer {
  email: string;
  role: Role;
}

export interface LoanListItem extends Loan {
  bookTitle: string;
}

export interface LoanList {
  items: LoanListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export type SubmitLoanResult =
  | { ok: true; loan: Loan }
  | { ok: false; message: string };

export type CancelLoanResult = 'ok' | 'not-found' | 'forbidden' | 'not-pending';

const PAGE_SIZE = 10;

/** Chỉ nhận 3 trạng thái hợp lệ, giá trị khác coi như không lọc. */
export const parseStatus = (value: string | undefined): LoanStatus | '' => {
  if (value === 'pending' || value === 'approved' || value === 'rejected') {
    return value;
  }
  return '';
};

export function listLoans(
  viewer: LoanViewer,
  status: string,
  page: number,
): LoanList {
  const normalizedStatus = parseStatus(status);
  const viewAll = can(viewer.role, 'loan:view-all');

  const filtered = db.loans.filter((loan) => {
    if (!viewAll && loan.userEmail !== viewer.email) return false;
    if (normalizedStatus !== '' && loan.status !== normalizedStatus) {
      return false;
    }
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const safePage = Number.isFinite(page) ? Math.trunc(page) : 1;
  const currentPage = Math.min(Math.max(safePage, 1), totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const items = filtered.slice(start, start + PAGE_SIZE).map((loan) => ({
    ...loan,
    bookTitle:
      db.books.find((book) => book.id === loan.bookId)?.title ?? 'Không rõ',
  }));

  return { items, total, page: currentPage, totalPages };
}

/** Tạo yêu cầu mượn mới nếu còn đủ bản vào ngày lấy sách. */
export function submitLoan(email: string, data: LoanData): SubmitLoanResult {
  const book = db.books.find((item) => item.id === data.bookId);

  if (!book) {
    return { ok: false, message: 'Không tìm thấy sách' };
  }

  const taken = db.loans
    .filter(
      (loan) =>
        loan.bookId === data.bookId &&
        loan.pickupDate === data.pickupDate &&
        loan.status !== 'rejected',
    )
    .reduce((sum, loan) => sum + loan.quantity, 0);

  if (taken + data.quantity > book.copies) {
    return { ok: false, message: 'Sách đã hết bản vào ngày này' };
  }

  const loan: Loan = {
    id: db.nextLoanId++,
    bookId: data.bookId,
    userEmail: email,
    pickupDate: data.pickupDate,
    term: data.term,
    quantity: data.quantity,
    reason: data.reason,
    status: 'pending',
  };

  db.loans.unshift(loan);

  return { ok: true, loan };
}

/** Hủy yêu cầu của chính mình khi vẫn còn chờ duyệt. */
export function cancelLoan(email: string, id: number): CancelLoanResult {
  const index = db.loans.findIndex((loan) => loan.id === id);

  if (index === -1) return 'not-found';

  const loan = db.loans[index];
  if (loan.userEmail !== email) return 'forbidden';
  if (loan.status !== 'pending') return 'not-pending';

  db.loans.splice(index, 1);

  return 'ok';
}
