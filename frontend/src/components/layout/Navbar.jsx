import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { LogoutButton } from '@/components/ui/LogoutButton';
import logo from '@/assets/logo.png';

export function Navbar() {
  const { user } = useAuth();
  const displayName = user?.name || user?.email || '';
  const initials = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <Link
        to="/"
        className="flex items-center gap-3 hover:opacity-90 transition-opacity"
      >
        <img src={logo} alt="CNAT Maker" className="h-9 w-auto object-contain" />
        <span className="text-base font-semibold text-gray-900">CNAT Maker</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link
          to="/profile"
          title="Meu Perfil"
          aria-label="Meu Perfil"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 text-sm font-semibold text-forest-700 hover:bg-forest-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2 transition-all"
        >
          {initials}
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}