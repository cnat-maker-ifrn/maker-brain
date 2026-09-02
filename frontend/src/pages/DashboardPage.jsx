import { useMyVisits, VisitCard, CreateVisitButton } from '@/features/makerapp';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const { visits, isLoading, error, refetch } = useMyVisits();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-forest-600">Meus Agendamentos</h1>
        <CreateVisitButton onCreated={refetch} />
      </div>

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