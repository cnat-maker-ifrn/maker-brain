import { AuthPageShell } from '@/components/layout/AuthPageShell';
import { LoginForm } from '@/features/makerauth';

export function LoginPage() {
  return (
    <AuthPageShell title="Entrar" subtitle="Acesse o painel do laboratório CNAT">
      <LoginForm />
    </AuthPageShell>
  );
}