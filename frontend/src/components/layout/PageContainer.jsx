import { LogoutButton } from '@/components/ui/LogoutButton';

export function PageContainer({ children, className = '' }) {
  return (
    <div className="relative min-h-dvh bg-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #1f7a4d 1px, transparent 1px), linear-gradient(to bottom, #1f7a4d 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6 z-10">
        <LogoutButton className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5" />
      </div>
      <div className={`relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 ${className}`}>
        {children}
      </div>
    </div>
  );
}