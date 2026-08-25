import { useNavigate, Link } from 'react-router-dom';
import { RequesterRegisterForm } from '@/features/makerauth';
import { AuthPageShell } from '@/components/layout/AuthPageShell';

export function RegisterRequesterPage() {
  const navigate = useNavigate();

  return (
    <AuthPageShell
      title="Solicite acesso ao laboratório"
      description="Cadastre-se como solicitante para agendar visitas técnicas, infantis ou rápidas ao MakerLab. A aprovação depende do seu vínculo institucional."
      footer={
        <>
          É bolsista do MakerLab?{' '}
          <Link to="/register/bolsista" className="font-medium text-amber-400 underline-offset-4 hover:underline">
            Cadastre-se como bolsista
          </Link>
          <br />
          Já tem uma conta?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-medium text-amber-400 underline-offset-4 hover:underline"
          >
            Entrar
          </button>
        </>
      }
    >
      <RequesterRegisterForm onRegistered={() => navigate('/login')} />
    </AuthPageShell>
  );
}