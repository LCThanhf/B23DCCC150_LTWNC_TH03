import type { Book } from '@/types';

export interface LoanInput {
  bookId: string;
  pickupDate: string;
  term: string;
  quantity: string;
  reason: string;
}

export interface LoanData {
  bookId: number;
  pickupDate: string;
  term: 7 | 14 | 30;
  quantity: number;
  reason: string;
}

export type LoanErrors = Partial<Record<keyof LoanInput, string>>;

export interface LoanFormState {
  errors: LoanErrors; // lỗi từng ô
  values: Partial<LoanInput>; // giá trị đã nhập, để hiện lại khi có lỗi
  message?: string; // thông báo chung (thành công hoặc lỗi từ server)
  ok?: boolean; // true nếu message là thông báo thành công
}

const VALID_TERMS = [7, 14, 30];

const pad = (value: number): string => String(value).padStart(2, '0');

const asString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

const readField = (
  raw: FormData | Record<string, unknown>,
  key: keyof LoanInput,
): string =>
  raw instanceof FormData ? asString(raw.get(key)) : asString(raw[key]);

/** Đổi object hoặc FormData thành LoanInput; trường thiếu thành chuỗi rỗng. */
export const toLoanInput = (
  raw: FormData | Record<string, unknown>,
): LoanInput => ({
  bookId: readField(raw, 'bookId'),
  pickupDate: readField(raw, 'pickupDate'),
  term: readField(raw, 'term'),
  quantity: readField(raw, 'quantity'),
  reason: readField(raw, 'reason'),
});

/** Ngày hôm nay theo giờ địa phương, dạng YYYY-MM-DD. */
export const today = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

/** Nơi duy nhất giữ các quy tắc kiểm tra dữ liệu mượn sách. */
export const validateLoan = (
  input: LoanInput,
  books: Book[],
): LoanErrors => {
  const errors: LoanErrors = {};

  const book = books.find((item) => String(item.id) === input.bookId.trim());
  if (!book) {
    errors.bookId = 'Hãy chọn sách';
  }

  const pickupDate = input.pickupDate.trim();
  if (!isValidDate(pickupDate)) {
    errors.pickupDate = 'Hãy chọn ngày';
  } else if (pickupDate < today()) {
    errors.pickupDate = 'Ngày lấy sách không được ở quá khứ';
  }

  const term = Number(input.term);
  if (input.term.trim() === '' || !VALID_TERMS.includes(term)) {
    errors.term = 'Hãy chọn thời hạn';
  }

  const quantity = Number(input.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    errors.quantity = 'Số quyển phải từ 1 trở lên';
  } else if (book && quantity > book.copies) {
    errors.quantity = `Vượt số bản của sách (${book.copies} bản)`;
  }

  if (input.reason.trim().length < 10) {
    errors.reason = 'Lý do tối thiểu 10 ký tự';
  }

  return errors;
};

/** Chỉ gọi khi validateLoan không còn lỗi. */
export const toLoanData = (input: LoanInput): LoanData => ({
  bookId: Number(input.bookId),
  pickupDate: input.pickupDate.trim(),
  term: Number(input.term) as LoanData['term'],
  quantity: Number(input.quantity),
  reason: input.reason.trim(),
});
