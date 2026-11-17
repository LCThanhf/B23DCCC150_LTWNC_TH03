import { describe, expect, it } from 'vitest';
import { generateBooks } from '@/data/books';
import {
  toLoanData,
  toLoanInput,
  today,
  validateLoan,
} from './loan-validate';
import type { LoanInput } from './loan-validate';

const books = generateBooks(24);

const pad = (value: number): string => String(value).padStart(2, '0');

const shiftDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const validInput: LoanInput = {
  bookId: '11',
  pickupDate: shiftDate(3),
  term: '14',
  quantity: '1',
  reason: 'Mượn để làm bài tập lớn môn cơ sở dữ liệu',
};

describe('validateLoan', () => {
  it('dữ liệu hợp lệ trả về object rỗng', () => {
    expect(validateLoan(validInput, books)).toEqual({});
  });

  it('form trống báo đủ lỗi cho cả 5 trường', () => {
    const errors = validateLoan(
      { bookId: '', pickupDate: '', term: '', quantity: '', reason: '' },
      books,
    );

    expect(errors).toEqual({
      bookId: 'Hãy chọn sách',
      pickupDate: 'Hãy chọn ngày',
      term: 'Hãy chọn thời hạn',
      quantity: 'Số quyển phải từ 1 trở lên',
      reason: 'Lý do tối thiểu 10 ký tự',
    });
  });

  it('báo lỗi khi ngày lấy sách ở quá khứ', () => {
    const errors = validateLoan(
      { ...validInput, pickupDate: shiftDate(-1) },
      books,
    );

    expect(errors.pickupDate).toBe('Ngày lấy sách không được ở quá khứ');
  });

  it('báo lỗi khi lý do dưới 10 ký tự', () => {
    expect(validateLoan({ ...validInput, reason: 'ngắn' }, books).reason).toBe(
      'Lý do tối thiểu 10 ký tự',
    );
  });

  it('lý do toàn khoảng trắng cũng không hợp lệ', () => {
    expect(
      validateLoan({ ...validInput, reason: '            ' }, books).reason,
    ).toBe('Lý do tối thiểu 10 ký tự');
  });

  it('báo lỗi khi số quyển vượt số bản của sách', () => {
    // Sách id 1 (Lập trình C căn bản) chỉ có 1 bản.
    const errors = validateLoan(
      { ...validInput, bookId: '1', quantity: '2' },
      books,
    );

    expect(errors.quantity).toBe('Vượt số bản của sách (1 bản)');
  });

  it.each(['0', '-2', '1.5', 'abc'])(
    'số quyển %s không phải số nguyên dương',
    (quantity) => {
      const errors = validateLoan({ ...validInput, quantity }, books);
      expect(errors.quantity).toBe('Số quyển phải từ 1 trở lên');
    },
  );

  it('báo lỗi khi thời hạn không hợp lệ', () => {
    expect(validateLoan({ ...validInput, term: '10' }, books).term).toBe(
      'Hãy chọn thời hạn',
    );
  });
});

describe('toLoanData', () => {
  it('ép kiểu số từ chuỗi và trim lý do', () => {
    expect(
      toLoanData({
        bookId: '11',
        pickupDate: '2026-12-03',
        term: '30',
        quantity: '2',
        reason: '  Mượn sách để học  ',
      }),
    ).toEqual({
      bookId: 11,
      pickupDate: '2026-12-03',
      term: 30,
      quantity: 2,
      reason: 'Mượn sách để học',
    });
  });
});

describe('toLoanInput', () => {
  it('đọc được dữ liệu từ FormData', () => {
    const formData = new FormData();
    formData.set('bookId', '6');
    formData.set('pickupDate', '2026-12-20');
    formData.set('term', '14');
    formData.set('quantity', '2');
    formData.set('reason', 'Mượn để học an toàn mạng');

    expect(toLoanInput(formData)).toEqual({
      bookId: '6',
      pickupDate: '2026-12-20',
      term: '14',
      quantity: '2',
      reason: 'Mượn để học an toàn mạng',
    });
  });

  it('trường thiếu trở thành chuỗi rỗng', () => {
    expect(toLoanInput({ bookId: '6' })).toEqual({
      bookId: '6',
      pickupDate: '',
      term: '',
      quantity: '',
      reason: '',
    });
  });
});

describe('today', () => {
  it('trả về ngày hôm nay dạng YYYY-MM-DD', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
