import type { Role } from '@/types';

export type Action =
  | 'book:view'
  | 'loan:create'
  | 'loan:view-own'
  | 'loan:view-all'
  | 'loan:review';

type Principal = Role | 'guest';

const MATRIX: Record<Action, Principal[]> = {
  'book:view': ['guest', 'student', 'admin'],
  'loan:create': ['student'],
  'loan:view-own': ['student'],
  'loan:view-all': ['admin'],
  'loan:review': ['admin'],
};

/** Kiểm tra quyền theo ma trận; role undefined nghĩa là khách chưa đăng nhập. */
export const can = (role: Role | undefined, action: Action): boolean =>
  MATRIX[action].includes(role ?? 'guest');
