import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  robots: { index: false },
};

const DEFAULT_CALLBACK = '/loans';

const safeCallbackUrl = (value: string | undefined): string => {
  if (!value) return DEFAULT_CALLBACK;
  if (!value.startsWith('/') || value.startsWith('//')) return DEFAULT_CALLBACK;
  return value;
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect('/');
  }

  const { callbackUrl } = await searchParams;

  return (
    <section className="auth">
      <h1>Đăng nhập</h1>
      <p className="lead">
        Đăng nhập để gửi yêu cầu mượn sách và theo dõi các sách đã mượn.
      </p>

      <LoginForm callbackUrl={safeCallbackUrl(callbackUrl)} />

      <p className="muted small">
        Tài khoản mẫu: sv01@ptit.edu.vn / sv123456 · admin@ptit.edu.vn / admin123
      </p>
    </section>
  );
}
