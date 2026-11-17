import { describe, expect, it } from 'vitest';
import { can } from './permissions';
import type { Action } from './permissions';

const ALL_ACTIONS: Action[] = [
  'book:view',
  'loan:create',
  'loan:view-own',
  'loan:view-all',
  'loan:review',
];

describe('can', () => {
  it('khách chỉ được xem sách', () => {
    expect(can(undefined, 'book:view')).toBe(true);
    expect(ALL_ACTIONS.filter((action) => can(undefined, action))).toEqual([
      'book:view',
    ]);
  });

  it('student gửi được yêu cầu mượn nhưng không được duyệt', () => {
    expect(can('student', 'loan:create')).toBe(true);
    expect(can('student', 'loan:view-own')).toBe(true);
    expect(can('student', 'loan:review')).toBe(false);
    expect(can('student', 'loan:view-all')).toBe(false);
  });

  it('admin duyệt được nhưng không tạo yêu cầu mượn', () => {
    expect(can('admin', 'loan:review')).toBe(true);
    expect(can('admin', 'loan:view-all')).toBe(true);
    expect(can('admin', 'loan:create')).toBe(false);
  });
});
