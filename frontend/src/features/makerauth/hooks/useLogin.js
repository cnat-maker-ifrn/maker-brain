import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '@/context/AuthContext.jsx';
import { extractServerErrors } from '@/frontLib/apiErrors';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submitLogin = async ({ email, password }) => {
    setIsLoading(true);
    setErrors(null);

    try {
      const tokens = await authService.login({ email, password });
      login(tokens);
      navigate('/dashboard');
    } catch (err) {
      setErrors(extractServerErrors(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { submitLogin, isLoading, errors };
}