import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '@/context/AuthContext';
import { parseApiError } from '@/frontLib/apiErrors';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submitLogin = async ({ email, password }) => {
    setIsLoading(true);
    setError(null);

    try {
      const tokens = await authService.login({ email, password });
      login(tokens);
      navigate('/dashboard');
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { submitLogin, isLoading, error };
}