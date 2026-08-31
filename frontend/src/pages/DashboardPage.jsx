import { useMyVisits, VisitCard } from '@/features/makerapp';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const { visits, isLoading, error } = useMyVisits();

  return (
    <>
      <h1 className="text-2xl font-semibold text-forest-600 mb-6">Meus Agendamentos</h1>

      {isLoading && <Spinner />}
      {error && <p className="text-danger-600">{error.non_field_errors || error.detail}</p>}

      {!isLoading && visits.length === 0 && (
        <p className="text-gray-500">Nenhum agendamento encontrado.</p>
      )}

      <div className="flex flex-col gap-3">
        {visits.map((visit) => (
          <VisitCard key={visit.id} visit={visit} />
        ))}
      </div>
    </>
  );
}