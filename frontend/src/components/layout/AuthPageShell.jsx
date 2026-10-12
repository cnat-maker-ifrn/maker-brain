export function AuthPageShell({ eyebrow, title, description, children, footer }) {
  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col justify-center">
      <div className="mx-auto flex w-full max-w-2xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-16">
        <header className="mb-6 sm:mb-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-forest-600">
            MAKERBRAIN — CNATMAKER
          </span>
          <h1 className="mt-2 sm:mt-3 text-2xl font-semibold text-gray-900 sm:text-3xl md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 sm:mt-3 max-w-lg text-sm leading-relaxed text-gray-500">
              {description}
            </p>
          )}
          {eyebrow ? <div className="mt-3 sm:mt-4">{eyebrow}</div> : null}
        </header>

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm">
          {children}
        </div>

        {footer ? <div className="mt-6 text-center text-sm text-gray-500">{footer}</div> : null}
      </div>
    </div>
  );
}