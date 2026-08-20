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
        <label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-amber-500/80">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="bg-graphite-800 border border-graphite-600 rounded-md px-3 py-2.5
                     text-graphite-50 placeholder:text-graphite-500
                     focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60
                     transition-colors"
          placeholder="voce@ifrn.edu.br"
        />
        {errors?.email && <p className="text-xs text-red-400">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-mono uppercase tracking-wider text-amber-500/80">
            Senha
          </label>
          <Link to="/forgot-password" className="text-xs text-graphite-400 hover:text-amber-500 transition-colors">
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
          className="bg-graphite-800 border border-graphite-600 rounded-md px-3 py-2.5
                     text-graphite-50 placeholder:text-graphite-500
                     focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60
                     transition-colors"
          placeholder="••••••••"
        />
        {errors?.password && <p className="text-xs text-red-400">{errors.password}</p>}
      </div>

      {generalError && (
        <p role="alert" className="text-sm text-red-400 border border-red-900/60 bg-red-950/30 rounded-md px-3 py-2">
          {generalError}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-1 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40
                   disabled:cursor-not-allowed text-graphite-950 font-semibold
                   rounded-md py-2.5 transition-colors"
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="text-center text-sm text-graphite-400">
        Não tem conta?{' '}
        <Link to="/register" className="text-amber-500 hover:text-amber-400 transition-colors">
          Cadastre-se como visitante
        </Link>
      </p>
    </form>
  );
}