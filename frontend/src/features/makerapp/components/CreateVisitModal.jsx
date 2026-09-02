import { CreateVisitForm } from './CreateVisitForm';

export function CreateVisitModal({ isOpen, onClose, onCreated }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-forest-600">Nova visita</p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">Agendar visita</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <CreateVisitForm
          onCreated={() => {
            onCreated?.();
            onClose();
          }}
        />
      </div>
    </div>
  );
}