export function Select({ label, id, error, options, placeholder, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium tracking-wide text-stone-300">
        {label}
      </label>
      <select
        id={id}
        className={`w-full appearance-none rounded-md border bg-stone-950/60 px-3.5 py-2.5 text-stone-100
          outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40
          ${error ? 'border-red-500/70' : 'border-stone-700'} ${className}`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </div>
  );
}