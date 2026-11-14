import { AuthPageShell } from '@/components/layout/AuthPageShell';
import { LoginForm } from '@/features/makerauth';

export function LoginPage() {
  return (
    <AuthPageShell title="Entrar" description="Acesse o sistema de agendamento do laboratório CNAT Maker!">
      <LoginForm />
    </AuthPageShell>
  );
}