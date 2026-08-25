import { useNavigate, Link } from 'react-router-dom';
import { ScholarshipStudentRegisterForm } from '@/features/makerauth';
import { AuthPageShell } from '@/components/layout/AuthPageShell';

export function RegisterScholarshipStudentPage() {
  const navigate = useNavigate();

  return (
    <AuthPageShell
      title="Cadastro de bolsista"
      description="Envie seus dados para se tornar bolsista do MakerLab. Sua conta ficará pendente até a aprovação de um responsável do laboratório."
      footer={
        <>
          Vai apenas agendar uma visita?{' '}
          <Link to="/register" className="font-medium text-amber-400 underline-offset-4 hover:underline">
            Cadastre-se como solicitante
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
      <ScholarshipStudentRegisterForm onRegistered={() => {}} />
    </AuthPageShell>
  );
}