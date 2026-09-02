import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { LogoutButton } from '@/components/ui/LogoutButton';

export function Navbar() {
  const { user } = useAuth();
  const initials = user?.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <Link
        to="/"
        className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-forest-600"
      >
        MakerBrain
      </Link>

      <div className="flex items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 text-sm font-semibold text-forest-700">
          {initials}
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}