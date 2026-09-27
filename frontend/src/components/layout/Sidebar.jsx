import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import logo from '@/assets/logo.png';

const MANAGER_GROUPS = ['Owners', 'Managers'];
const VISIT_MANAGER_GROUPS = ['Owners', 'Managers', 'Scholarship Students'];

const linkClassName = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-forest-50 text-forest-700 font-semibold'
      : 'text-gray-600 hover:bg-gray-50 hover:text-forest-600'
  }`;

export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const isManager = user?.groups?.some((g) => MANAGER_GROUPS.includes(g));
  const canManageVisits = user?.groups?.some((g) => VISIT_MANAGER_GROUPS.includes(g));

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const navContent = (
    <nav className="flex flex-col gap-1">
      <NavLink to="/" onClick={handleLinkClick} className={linkClassName} end>
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Dashboard</span>
      </NavLink>

      <NavLink to="/profile" onClick={handleLinkClick} className={linkClassName}>
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Meu perfil</span>
      </NavLink>

      {canManageVisits && (
        <NavLink to="/visits" onClick={handleLinkClick} className={linkClassName}>
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Gerenciamento de visitas</span>
        </NavLink>
      )}

      {isManager && (
        <NavLink to="/scholarship-students/pending" onClick={handleLinkClick} className={linkClassName}>
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Aprovação de bolsistas</span>
        </NavLink>
      )}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white px-3 py-4 min-h-[calc(100dvh-4rem)]">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col border-r border-gray-200 bg-white p-4 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu de navegação"
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="CNAT Maker" className="h-8 w-auto object-contain" />
            <span className="font-montserrat font-semibold text-gray-900 text-base">CNAT Maker</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-forest-500"
            aria-label="Fechar menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {navContent}
        </div>

        {user && (
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-1">
            <p className="text-xs text-gray-500">Conectado como</p>
            <p className="text-xs font-semibold text-gray-800 truncate">{user.name || user.email}</p>
          </div>
        )}
      </aside>
    </>
  );
}