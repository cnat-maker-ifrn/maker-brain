export function Input({ label, id, error, hint, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium tracking-wide text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-gray-900
          placeholder:text-gray-400 outline-none transition-colors
          focus:border-forest-500 focus:ring-1 focus:ring-forest-500/40
          ${error ? 'border-danger-500/70' : 'border-gray-200'} ${className}`}
        {...props}
      />
      {error ? (
        <span className="text-xs text-danger-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-gray-500">{hint}</span>
      ) : null}
    </div>
  );
}