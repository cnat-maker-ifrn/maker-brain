export function Button({ children, isLoading, disabled, className = '', ...props }) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5
        text-sm font-semibold tracking-wide text-stone-950 transition-colors
        hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400
        ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-950/30 border-t-stone-950" />
      ) : null}
      {children}
    </button>
  );
}