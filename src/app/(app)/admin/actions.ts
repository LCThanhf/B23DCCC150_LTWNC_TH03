'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { can } from '@/lib/permissions';
import type { LoanStatus } from '@/types';

export async function reviewLoan(
  id: number,
  status: LoanStatus,
): Promise<void> {
  // Server Action là endpoint công khai: luôn tự kiểm tra quyền.
  const session = await auth();

  if (!can(session?.user.role, 'loan:review')) {
    throw new Error('Không có quyền');
  }

  if (status !== 'approved' && status !== 'rejected') {
    return;
  }

  const loan = db.loans.find((item) => item.id === id);

  if (!loan || loan.status !== 'pending') {
    return;
  }

  loan.status = status;
  revalidatePath('/admin');
}
