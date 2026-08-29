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
      className={`rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600
        transition-colors hover:border-forest-500/60 hover:text-forest-600 ${className}`}
    >
      Sair
    </button>
  );
}