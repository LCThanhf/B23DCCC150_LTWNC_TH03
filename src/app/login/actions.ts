'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

export interface LoginState {
  error: string;
  redirectTo: string;
}

const DEFAULT_CALLBACK = '/loans';

const safeCallbackUrl = (value: FormDataEntryValue | null): string => {
  if (typeof value !== 'string') return DEFAULT_CALLBACK;
  if (!value.startsWith('/') || value.startsWith('//')) return DEFAULT_CALLBACK;
  return value;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const callbackUrl = safeCallbackUrl(formData.get('callbackUrl'));

  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: callbackUrl,
      // Không redirect ngay để client tự điều hướng bằng một lần tải trang mới,
      // nhờ vậy SessionProvider đọc lại phiên và menu cập nhật ngay.
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Email hoặc mật khẩu không đúng', redirectTo: '' };
    }
    // redirect()/notFound() của Next.js ném exception: phải ném lại để hoạt động.
    throw error;
  }

  return { error: '', redirectTo: callbackUrl };
}
