import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '@/features/makerauth';

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #E8A33D 1px, transparent 1px), linear-gradient(to bottom, #E8A33D 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
        <header className="mb-10">
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-amber-500">
            MakerBrain · Laboratório CNAT
          </span>
          <h1 className="mt-3 text-3xl font-semibold text-stone-50 sm:text-4xl">
            Solicite acesso ao laboratório
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-400">
            Cadastre-se como solicitante para agendar visitas técnicas, infantis ou rápidas ao
            MakerLab. A aprovação depende do seu vínculo institucional.
          </p>
        </header>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8">
          <RegisterForm onRegistered={() => navigate('/login')} />
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          Já tem uma conta?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-medium text-amber-400 underline-offset-4 hover:underline"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}