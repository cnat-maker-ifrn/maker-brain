import { useState } from 'react';
import { CreateServiceModal } from './CreateServiceModal';

export function CreateServiceButton({ onCreated, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 rounded-md border border-forest-500 px-4 py-2.5 text-sm font-semibold
          text-forest-600 transition-colors hover:bg-forest-50 ${className}`}
      >
        + Novo serviço
      </button>

      <CreateServiceModal isOpen={isOpen} onClose={() => setIsOpen(false)} onCreated={onCreated} />
    </>
  );
}