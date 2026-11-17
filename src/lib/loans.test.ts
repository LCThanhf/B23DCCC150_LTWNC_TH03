import { beforeEach, describe, expect, it } from 'vitest';
import { generateBooks, generateLoans } from '@/data/books';
import { db } from './db';
import { cancelLoan, listLoans, parseStatus, submitLoan } from './loans';
import type { LoanViewer } from './loans';

const STUDENT: LoanViewer = { email: 'sv01@ptit.edu.vn', role: 'student' };
const OTHER_STUDENT = 'sv02@ptit.edu.vn';
const ADMIN: LoanViewer = { email: 'admin@ptit.edu.vn', role: 'admin' };

beforeEach(() => {
  db.books = generateBooks(24);
  db.loans = generateLoans(37);
  db.nextLoanId = 38;
});

describe('listLoans', () => {
  it('sv01 có 27 yêu cầu chia 3 trang 10/10/7', () => {
    const first = listLoans(STUDENT, '', 1);
    expect(first.total).toBe(27);
    expect(first.totalPages).toBe(3);
    expect(first.items).toHaveLength(10);

    expect(listLoans(STUDENT, '', 2).items).toHaveLength(10);

    const last = listLoans(STUDENT, '', 3);
    expect(last.items).toHaveLength(7);
    expect(last.items.every((loan) => loan.userEmail === STUDENT.email)).toBe(
      true,
    );
    expect(last.items[0].bookTitle.length).toBeGreaterThan(0);
  });

  it('admin thấy tất cả 37 yêu cầu', () => {
    expect(listLoans(ADMIN, '', 1).total).toBe(37);
    expect(listLoans(ADMIN, '', 1).totalPages).toBe(4);
  });

  it('trang vượt giới hạn bị kẹp lại', () => {
    expect(listLoans(STUDENT, '', 99).page).toBe(3);
    expect(listLoans(STUDENT, '', 0).page).toBe(1);
    expect(listLoans(STUDENT, '', Number.NaN).page).toBe(1);
  });

  it('lọc theo trạng thái chờ duyệt', () => {
    const result = listLoans(STUDENT, 'pending', 1);
    expect(result.total).toBe(9);
    expect(result.items.every((loan) => loan.status === 'pending')).toBe(true);
  });
});

describe('parseStatus', () => {
  it('chỉ nhận 3 trạng thái hợp lệ', () => {
    expect(parseStatus('pending')).toBe('pending');
    expect(parseStatus('approved')).toBe('approved');
    expect(parseStatus('rejected')).toBe('rejected');
    expect(parseStatus('không-hợp-lệ')).toBe('');
    expect(parseStatus(undefined)).toBe('');
  });
});

describe('submitLoan', () => {
  it('báo hết bản với sách id 6 ngày 2026-12-02', () => {
    const result = submitLoan(STUDENT.email, {
      bookId: 6,
      pickupDate: '2026-12-02',
      term: 14,
      quantity: 1,
      reason: 'Mượn phục vụ môn học',
    });

    expect(result).toEqual({
      ok: false,
      message: 'Sách đã hết bản vào ngày này',
    });
  });

  it('tạo được yêu cầu rồi hủy trả đúng 3 mã', () => {
    const created = submitLoan(STUDENT.email, {
      bookId: 11,
      pickupDate: '2026-12-03',
      term: 14,
      quantity: 1,
      reason: 'Mượn phục vụ môn học',
    });

    expect(created.ok).toBe(true);
    if (!created.ok) return;

    expect(created.loan.status).toBe('pending');
    expect(created.loan.id).toBe(38);
    expect(db.loans[0].id).toBe(created.loan.id);

    expect(cancelLoan(OTHER_STUDENT, created.loan.id)).toBe('forbidden');
    expect(cancelLoan(STUDENT.email, created.loan.id)).toBe('ok');
    expect(cancelLoan(STUDENT.email, created.loan.id)).toBe('not-found');
  });
});
