import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

const MANAGER_GROUPS = ['Owners', 'Managers'];
const VISIT_MANAGER_GROUPS = ['Owners', 'Managers', 'Scholarship Students'];

const linkClassName = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-forest-50 text-forest-700'
      : 'text-gray-600 hover:bg-gray-50 hover:text-forest-600'
  }`;

export function Sidebar() {
  const { user } = useAuth();
  const isManager = user?.groups?.some((g) => MANAGER_GROUPS.includes(g));
  const canManageVisits = user?.groups?.some((g) => VISIT_MANAGER_GROUPS.includes(g));

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white px-3 py-4">
      <nav className="flex flex-col gap-1">
        <NavLink to="/" className={linkClassName}>
          Dashboard
        </NavLink>

        {canManageVisits && (
          <NavLink to="/visits" className={linkClassName}>
            Gerenciamento de visitas
          </NavLink>
        )}

        {isManager && (
          <NavLink to="/scholarship-students/pending" className={linkClassName}>
            Aprovação de bolsistas
          </NavLink>
        )}
      </nav>
    </aside>
  );
}