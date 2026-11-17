'use client';

import { useActionState, useEffect, useState } from 'react';
import { TERM_LABEL } from '@/lib/format';
import type { LoanFormState } from '@/lib/loan-validate';
import type { Book, Term } from '@/types';

const TERM_OPTIONS: Term[] = [7, 14, 30];

const initialState: LoanFormState = { errors: {}, values: {} };

interface LoanFormProps {
  books: Book[];
  defaultBookId?: number;
  action: (prev: LoanFormState, formData: FormData) => Promise<LoanFormState>;
}

export function LoanForm({ books, defaultBookId, action }: LoanFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [showSuccess, setShowSuccess] = useState(false);

  // Thông báo thành công tự ẩn sau vài giây; lỗi vẫn giữ nguyên.
  useEffect(() => {
    if (!state.ok || !state.message) return;

    const showTimer = setTimeout(() => setShowSuccess(true), 0);
    const hideTimer = setTimeout(() => setShowSuccess(false), 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [state]);

  const { values, errors } = state;

  // Sau khi gửi thành công thì xoá trắng form; còn khi có lỗi thì giữ lại
  // đúng những gì người dùng đã nhập.
  const bookValue = state.ok
    ? ''
    : (values.bookId ?? (defaultBookId ? String(defaultBookId) : ''));
  const dateValue = state.ok ? '' : (values.pickupDate ?? '');
  const termValue = state.ok ? '' : (values.term ?? '');
  const quantityValue = state.ok ? '1' : (values.quantity ?? '1');
  const reasonValue = state.ok ? '' : (values.reason ?? '');

  // React 19 reset form sau mỗi lần submit; đổi key để form được dựng lại
  // với defaultValue lấy từ values mà action trả về.
  const formKey = state.ok ? 'ok' : JSON.stringify(values);

  return (
    <form key={formKey} className="panel loan-form" action={formAction}>
      <div className="field">
        <label htmlFor="bookId">Sách</label>
        <select id="bookId" name="bookId" defaultValue={bookValue}>
          <option value="">-- Chọn sách --</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title} ({book.copies} bản)
            </option>
          ))}
        </select>
        {errors.bookId ? (
          <p className="form-error" role="alert">
            {errors.bookId}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="pickupDate">Ngày lấy sách</label>
        <input
          id="pickupDate"
          name="pickupDate"
          type="date"
          defaultValue={dateValue}
        />
        {errors.pickupDate ? (
          <p className="form-error" role="alert">
            {errors.pickupDate}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="term">Thời hạn mượn</label>
        <select id="term" name="term" defaultValue={termValue}>
          <option value="">-- Chọn thời hạn --</option>
          {TERM_OPTIONS.map((term) => (
            <option key={term} value={term}>
              {TERM_LABEL[term]}
            </option>
          ))}
        </select>
        {errors.term ? (
          <p className="form-error" role="alert">
            {errors.term}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="quantity">Số quyển</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          defaultValue={quantityValue}
        />
        {errors.quantity ? (
          <p className="form-error" role="alert">
            {errors.quantity}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="reason">Lý do mượn</label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          defaultValue={reasonValue}
        />
        {errors.reason ? (
          <p className="form-error" role="alert">
            {errors.reason}
          </p>
        ) : null}
      </div>

      <button className="btn" type="submit" disabled={pending}>
        {pending ? 'Đang gửi...' : 'Gửi yêu cầu'}
      </button>

      {state.message && (!state.ok || showSuccess) ? (
        <p className={state.ok ? 'form-success' : 'form-error'} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
