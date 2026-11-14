import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { submitLogin, isLoading, errors } = useLogin();

  const handleSubmit = (event) => {
    event.preventDefault();
    submitLogin({ email, password });
  };

  const generalError = errors?.non_field_errors || errors?.detail;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        id="email"
        type="email"
        label="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        placeholder="voce@ifrn.edu.br"
        error={errors?.email}
      />

      <Input
        id="password"
        type="password"
        label="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors?.password}
      />

      {generalError && (
        <p role="alert" className="text-sm text-danger-600 border border-danger-100 bg-danger-50 rounded-md px-3 py-2">
          {generalError}
        </p>
      )}

      <Button
        type="submit"
        isLoading={isLoading}
        className="mt-1 w-full min-h-[44px]"
      >
        Entrar
      </Button>

      <p className="text-center text-sm text-gray-500">
        Não tem conta?{' '}
        <Link to="/register" className="text-forest-600 hover:text-forest-500 transition-colors font-medium">
          Cadastre-se como visitante
        </Link>
      </p>
    </form>
  );
}