import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

export function LogoutButton({ className = '' }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`rounded-md border border-stone-700 px-3 py-1.5 text-sm font-medium text-stone-300
        transition-colors hover:border-amber-500/60 hover:text-amber-400 ${className}`}
    >
      Sair
    </button>
  );
}