import { CreateServiceForm } from './CreateServiceForm';

export function CreateServiceModal({ isOpen, onClose, onCreated }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 overflow-y-auto">
      <div className="relative my-auto w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 sm:p-6 md:p-8 shadow-xl">
        <div className="mb-4 sm:mb-6 flex items-start justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-forest-600">Novo serviço</p>
            <h2 className="mt-1 text-lg sm:text-xl font-semibold text-gray-900">Solicitar serviço</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-forest-500"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <CreateServiceForm
          onCreated={() => {
            onCreated?.();
            onClose();
          }}
        />
      </div>
    </div>
  );
}