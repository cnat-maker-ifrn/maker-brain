import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '../services/authService';
import { useAuth } from '@/context/AuthContext';
import { extractServerErrors } from '@/frontLib/apiErrors';

/** Ícone de aviso (triângulo) */
function WarningIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-danger-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  );
}

/**
 * Formulário interno do modal — separado para facilitar reset de estado ao fechar.
 */
function DeleteAccountForm({ onClose }) {
  const { logout } = useAuth();

  // Passo 1: confirmação de intenção  |  Passo 2: digitar senha
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setFieldError('');
    setServerError('');
  };

  const handleConfirmIntent = () => setStep(2);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setFieldError('A senha é obrigatória para confirmar a exclusão.');
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      await authService.deleteAccount(password);
      logout();
    } catch (err) {
      const errors = extractServerErrors(err);
      setServerError(
        errors.password ||
          errors.non_field_errors ||
          errors.detail ||
          'Ocorreu um erro. Verifique sua senha e tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 overflow-y-auto">
      <div className="relative my-auto w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 sm:p-7 shadow-xl">
        {/* Cabeçalho */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-50 border border-danger-100">
              <WarningIcon />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Excluir conta</h2>
              <p className="mt-0.5 text-sm text-gray-500">Esta ação é permanente e irreversível.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-danger-500 disabled:opacity-50"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Passo 1: Aviso + botão de intenção */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-danger-50 border border-danger-100 p-4 text-sm text-danger-800 space-y-2">
              <p className="font-semibold">O que acontecerá com seus dados:</p>
              <ul className="list-disc list-inside space-y-1 text-danger-700">
                <li>Sua conta será <strong>desativada imediatamente</strong>.</li>
                <li>Seus dados pessoais (nome, e-mail, CPF, telefone) serão <strong>anonimizados</strong>.</li>
                <li>Seu histórico de visitas e serviços será mantido de forma anônima.</li>
                <li>Não será possível recuperar a conta após a exclusão.</li>
              </ul>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmIntent}
                className="rounded-md bg-danger-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2 transition-colors text-center"
              >
                Continuar com a exclusão
              </button>
            </div>
          </div>
        )}

        {/* Passo 2: Confirmação de senha */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <p className="text-sm text-gray-600">
              Para confirmar, digite sua senha atual abaixo. Após a exclusão, você será
              desconectado automaticamente.
            </p>

            {serverError && (
              <div className="rounded-md bg-danger-50 border border-danger-100 p-3 text-sm text-danger-700">
                {serverError}
              </div>
            )}

            <Input
              id="delete-account-password"
              type="password"
              label="Sua senha atual"
              value={password}
              onChange={handlePasswordChange}
              error={fieldError}
              placeholder="••••••••"
              autoComplete="current-password"
              autoFocus
              required
            />

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-danger-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-center flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Excluindo…
                  </>
                ) : (
                  'Excluir minha conta'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function DeleteAccountModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return <DeleteAccountForm onClose={onClose} />;
}
