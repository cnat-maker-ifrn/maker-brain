import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

const MANAGER_GROUPS = ['Owners', 'Managers'];

export function Sidebar() {
  const { user } = useAuth();
  const isManager = user?.groups?.some((g) => MANAGER_GROUPS.includes(g));

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white px-3 py-4">
      <nav className="flex flex-col gap-1">
        {isManager && (
          <NavLink
            to="/scholarship-students/pending"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-forest-50 text-forest-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-forest-600'
              }`
            }
          >
            Aprovação de bolsistas
          </NavLink>
        )}
      </nav>
    </aside>
  );
}