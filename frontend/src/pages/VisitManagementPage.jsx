import { useState } from 'react';
import { useVisitManagement, VisitCard, CloseVisitModal } from '@/features/makerapp';
import { Spinner } from '@/components/ui/Spinner';

export default function VisitManagementPage() {
  const { visits, isLoading, error, processingId, accept, reject, refetch } = useVisitManagement();
  const [closingVisit, setClosingVisit] = useState(null);

  return (
    <>
      <h1 className="text-xl sm:text-2xl font-semibold text-forest-600 mb-4 sm:mb-6">
        Gerenciamento de Visitas
      </h1>

      {isLoading && <Spinner />}
      {error && <p className="text-danger-600">{error.non_field_errors || error.detail}</p>}

      {!isLoading && visits.length === 0 && (
        <p className="text-gray-500">Nenhuma visita cadastrada.</p>
      )}

      <div className="flex flex-col gap-3">
        {visits.map((visit) => (
          <VisitCard
            key={visit.id}
            visit={visit}
            onAccept={accept}
            onReject={reject}
            onCloseVisit={() => setClosingVisit(visit)}
            isProcessing={processingId === visit.id}
          />
        ))}
      </div>

      <CloseVisitModal
        isOpen={Boolean(closingVisit)}
        visit={closingVisit}
        onClose={() => setClosingVisit(null)}
        onClosed={() => {
          setClosingVisit(null);
          refetch();
        }}
      />
    </>
  );
}