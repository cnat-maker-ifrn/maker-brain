import { LogoutButton } from '@/components/ui/LogoutButton';

export function PageContainer({ children, className = '' }) {
  return (
    <div className="relative min-h-screen bg-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #1f7a4d 1px, transparent 1px), linear-gradient(to bottom, #1f7a4d 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute right-6 top-6 z-10">
        <LogoutButton />
      </div>
      <div className={`relative mx-auto max-w-4xl px-6 py-12 ${className}`}>
        {children}
      </div>
    </div>
  );
}