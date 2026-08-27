import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';

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
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-forest-600">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="bg-white border border-gray-200 rounded-md px-3 py-2.5
                     text-gray-900 placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:border-forest-500
                     transition-colors"
          placeholder="voce@ifrn.edu.br"
        />
        {errors?.email && <p className="text-xs text-danger-600">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-mono uppercase tracking-wider text-forest-600">
            Senha
          </label>
          <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-forest-600 transition-colors">
            Esqueceu a senha?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="bg-white border border-gray-200 rounded-md px-3 py-2.5
                     text-gray-900 placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:border-forest-500
                     transition-colors"
          placeholder="••••••••"
        />
        {errors?.password && <p className="text-xs text-danger-600">{errors.password}</p>}
      </div>

      {generalError && (
        <p role="alert" className="text-sm text-danger-600 border border-danger-100 bg-danger-50 rounded-md px-3 py-2">
          {generalError}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-1 bg-forest-600 hover:bg-forest-500 disabled:bg-forest-600/40
                   disabled:cursor-not-allowed text-white font-semibold
                   rounded-md py-2.5 transition-colors"
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Não tem conta?{' '}
        <Link to="/register" className="text-forest-600 hover:text-forest-500 transition-colors">
          Cadastre-se como visitante
        </Link>
      </p>
    </form>
  );
}