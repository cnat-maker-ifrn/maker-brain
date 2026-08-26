export function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-stone-700 border-t-amber-500"
        role="status"
        aria-label="Carregando"
      />
    </div>
  );
}