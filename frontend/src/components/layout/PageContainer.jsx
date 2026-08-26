export function PageContainer({ children, className = '' }) {
  return (
    <div className="relative min-h-screen bg-stone-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #E8A33D 1px, transparent 1px), linear-gradient(to bottom, #E8A33D 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className={`relative mx-auto max-w-4xl px-6 py-12 ${className}`}>
        {children}
      </div>
    </div>
  );
}