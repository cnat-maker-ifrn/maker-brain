import { useState } from 'react';
import { CreateVisitModal } from './CreateVisitModal';

export function CreateVisitButton({ onCreated, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 rounded-md bg-forest-600 px-4 py-2.5 text-sm font-semibold
          text-white transition-colors hover:bg-forest-500 ${className}`}
      >
        + Nova visita
      </button>

      <CreateVisitModal isOpen={isOpen} onClose={() => setIsOpen(false)} onCreated={onCreated} />
    </>
  );
}