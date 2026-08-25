export function Input({ label, id, error, hint, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium tracking-wide text-stone-300">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-md border bg-stone-950/60 px-3.5 py-2.5 text-stone-100
          placeholder:text-stone-600 outline-none transition-colors
          focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40
          ${error ? 'border-red-500/70' : 'border-stone-700'} ${className}`}
        {...props}
      />
      {error ? (
        <span className="text-xs text-red-400">{error}</span>
      ) : hint ? (
        <span className="text-xs text-stone-500">{hint}</span>
      ) : null}
    </div>
  );
}