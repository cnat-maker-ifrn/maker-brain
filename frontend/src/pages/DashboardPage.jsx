import { useMyVisits, VisitCard, CreateVisitButton, CreateServiceButton } from '@/features/makerapp';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const { visits, isLoading, error, refetch } = useMyVisits();

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold text-forest-600">Meus Agendamentos</h1>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <CreateServiceButton className="flex-1 sm:flex-initial" />
          <CreateVisitButton onCreated={refetch} className="flex-1 sm:flex-initial" />
        </div>
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