import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateBooks } from '@/data/books';
import type { LoanFormState } from '@/lib/loan-validate';
import { LoanForm } from './LoanForm';

const books = generateBooks(24);

type Action = (
  prevState: LoanFormState,
  formData: FormData,
) => Promise<LoanFormState>;

const makeAction = (state: LoanFormState) =>
  vi.fn<Action>(async () => state);

describe('LoanForm', () => {
  it('hiện lỗi ngay dưới đúng ô khi action trả errors', async () => {
    const action = makeAction({
      errors: { bookId: 'Hãy chọn sách', reason: 'Lý do tối thiểu 10 ký tự' },
      values: { bookId: '', reason: 'ngắn' },
    });

    const user = userEvent.setup();
    render(<LoanForm books={books} action={action} />);

    await user.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));

    expect(await screen.findByText('Hãy chọn sách')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Sách').closest('.field'),
    ).toHaveTextContent('Hãy chọn sách');
    expect(
      screen.getByLabelText('Lý do mượn').closest('.field'),
    ).toHaveTextContent('Lý do tối thiểu 10 ký tự');
  });

  it('gọi action đúng 1 lần với FormData chứa bookId, term, quantity', async () => {
    const action = makeAction({
      errors: {},
      values: {},
      message: 'Đã gửi yêu cầu, chờ duyệt',
      ok: true,
    });

    const user = userEvent.setup();
    render(<LoanForm books={books} action={action} />);

    await user.selectOptions(screen.getByLabelText('Sách'), '6');
    fireEvent.change(screen.getByLabelText('Ngày lấy sách'), {
      target: { value: '2026-12-20' },
    });
    await user.selectOptions(screen.getByLabelText('Thời hạn mượn'), '14');
    await user.clear(screen.getByLabelText('Số quyển'));
    await user.type(screen.getByLabelText('Số quyển'), '2');
    await user.type(
      screen.getByLabelText('Lý do mượn'),
      'Mượn để học an toàn mạng',
    );
    await user.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));

    const formData = action.mock.calls[0][1];
    expect(formData.get('bookId')).toBe('6');
    expect(formData.get('term')).toBe('14');
    expect(formData.get('quantity')).toBe('2');
  });

  it('hiện thông báo hết bản và giữ lại dữ liệu đã nhập', async () => {
    const reason = 'Mượn để làm đồ án môn cơ sở dữ liệu';
    const action = makeAction({
      errors: {},
      values: {
        bookId: '11',
        pickupDate: '2026-12-03',
        term: '14',
        quantity: '1',
        reason,
      },
      message: 'Sách đã hết bản vào ngày này',
    });

    const user = userEvent.setup();
    render(<LoanForm books={books} action={action} />);

    await user.selectOptions(screen.getByLabelText('Sách'), '11');
    await user.type(screen.getByLabelText('Lý do mượn'), reason);
    await user.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));

    expect(
      await screen.findByText('Sách đã hết bản vào ngày này'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Lý do mượn')).toHaveValue(reason);
    expect(screen.getByLabelText('Sách')).toHaveValue('11');
  });

  it('chọn sẵn sách khi truyền defaultBookId', () => {
    render(
      <LoanForm
        books={books}
        defaultBookId={6}
        action={makeAction({ errors: {}, values: {} })}
      />,
    );

    expect(screen.getByLabelText('Sách')).toHaveValue('6');
    expect(
      screen.getByRole('option', { name: /An toàn mạng/ }),
    ).toBeInTheDocument();
  });
});
