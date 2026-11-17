import { describe, expect, it } from 'vitest';
import { STATUS_LABEL, TERM_LABEL, formatDate } from './format';

describe('formatDate', () => {
  it('đổi 2026-12-02 thành 02/12/2026', () => {
    expect(formatDate('2026-12-02')).toBe('02/12/2026');
  });
});

describe('nhãn hiển thị', () => {
  it('có nhãn tiếng Việt cho thời hạn', () => {
    expect(TERM_LABEL[7]).toBe('7 ngày');
    expect(TERM_LABEL[14]).toBe('14 ngày');
    expect(TERM_LABEL[30]).toBe('30 ngày');
  });

  it('có nhãn tiếng Việt cho trạng thái', () => {
    expect(STATUS_LABEL.pending).toBe('Chờ duyệt');
    expect(STATUS_LABEL.approved).toBe('Đã duyệt');
    expect(STATUS_LABEL.rejected).toBe('Từ chối');
  });
});
