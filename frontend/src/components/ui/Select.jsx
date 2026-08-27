export function Select({ label, id, error, options, placeholder, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium tracking-wide text-gray-700">
        {label}
      </label>
      <select
        id={id}
        className={`w-full appearance-none rounded-md border bg-white px-3.5 py-2.5 text-gray-900
          outline-none transition-colors focus:border-forest-500 focus:ring-1 focus:ring-forest-500/40
          ${error ? 'border-danger-500/70' : 'border-gray-200'} ${className}`}
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
      {error ? <span className="text-xs text-danger-600">{error}</span> : null}
    </div>
  );
}