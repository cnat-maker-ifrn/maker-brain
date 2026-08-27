export function Button({ children, isLoading, disabled, className = '', ...props }) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-forest-600 px-4 py-2.5
        text-sm font-semibold tracking-wide text-white transition-colors
        hover:bg-forest-500 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500
        ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : null}
      {children}
    </button>
  );
}