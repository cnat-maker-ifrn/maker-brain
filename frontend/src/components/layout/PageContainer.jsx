export function PageContainer({ children, className = '' }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`mx-auto max-w-6xl px-6 py-12 ${className}`}>
        {children}
      </div>
    </div>
  );
}