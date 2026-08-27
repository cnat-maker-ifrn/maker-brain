export function AuthPageShell({ eyebrow, title, description, children, footer }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
        <header className="mb-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-forest-600">
            MAKERBRAIN — CNATMAKER
          </span>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900 sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-500">{description}</p>
          {eyebrow ? <div className="mt-4">{eyebrow}</div> : null}
        </header>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>

        {footer ? <div className="mt-6 text-center text-sm text-gray-500">{footer}</div> : null}
      </div>
    </div>
  );
}