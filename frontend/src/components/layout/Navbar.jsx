import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { LogoutButton } from '@/components/ui/LogoutButton';
import logo from '@/assets/logo.png';

export function Navbar({ onMenuToggle, isMobileMenuOpen }) {
  const { user } = useAuth();
  const displayName = user?.name || user?.email || '';
  const initials = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-3.5 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMobileMenuOpen}
          className="inline-flex md:hidden items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest-500 transition-colors"
        >
          {isMobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity"
        >
          <img src={logo} alt="CNAT Maker" className="h-8 sm:h-9 w-auto object-contain" />
          <span className="font-montserrat text-base sm:text-lg font-semibold text-gray-900">CNAT Maker</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          to="/profile"
          title="Meu Perfil"
          aria-label="Meu Perfil"
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-forest-100 text-xs sm:text-sm font-semibold text-forest-700 hover:bg-forest-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2 transition-all"
        >
          {initials}
        </Link>
        <LogoutButton className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5" />
      </div>
    </header>
  );
}