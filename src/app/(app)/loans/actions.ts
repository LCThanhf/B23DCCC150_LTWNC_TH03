'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { toLoanData, toLoanInput, validateLoan } from '@/lib/loan-validate';
import type { LoanFormState } from '@/lib/loan-validate';
import { cancelLoan, submitLoan } from '@/lib/loans';
import { can } from '@/lib/permissions';

export async function createLoanAction(
  _prevState: LoanFormState,
  formData: FormData,
): Promise<LoanFormState> {
  // Server Action là endpoint công khai: luôn tự kiểm tra quyền.
  const session = await auth();
  const email = session?.user?.email ?? '';

  if (!can(session?.user?.role, 'loan:create') || !email) {
    throw new Error('Không có quyền');
  }

  const input = toLoanInput(formData);
  const errors = validateLoan(input, db.books);

  if (Object.keys(errors).length > 0) {
    return { errors, values: input };
  }

  const result = submitLoan(email, toLoanData(input));

  if (!result.ok) {
    return { errors: {}, values: input, message: result.message };
  }

  revalidatePath('/loans');

  return {
    errors: {},
    values: {},
    message: 'Đã gửi yêu cầu, chờ duyệt',
    ok: true,
  };
}

export async function cancelLoanAction(id: number): Promise<void> {
  const session = await auth();
  const email = session?.user?.email ?? '';

  if (!can(session?.user?.role, 'loan:view-own') || !email) {
    throw new Error('Không có quyền');
  }

  cancelLoan(email, id);
  revalidatePath('/loans');
}
