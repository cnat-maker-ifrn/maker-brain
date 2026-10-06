import {
  useMyVisits,
  useMyServices,
  VisitCard,
  ServiceCard,
  CreateVisitButton,
  CreateServiceButton,
} from '@/features/makerapp';
import { Spinner } from '@/components/ui/Spinner';
import { Carousel } from '@/components/ui/Carousel';

export default function DashboardPage() {
  const {
    visits,
    isLoading: visitsLoading,
    error: visitsError,
    refetch: refetchVisits,
  } = useMyVisits();

  const {
    services,
    isLoading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
  } = useMyServices();

  return (
    <div className="space-y-8 sm:space-y-10">
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-forest-600">Meus Agendamentos</h1>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <CreateServiceButton onCreated={refetchServices} className="flex-1 sm:flex-initial" />
            <CreateVisitButton onCreated={refetchVisits} className="flex-1 sm:flex-initial" />
          </div>
        </div>

        {visitsLoading && <Spinner />}
        {visitsError && (
          <p className="text-danger-600">{visitsError.non_field_errors || visitsError.detail}</p>
        )}

        {!visitsLoading && visits.length === 0 && (
          <p className="text-gray-500">Nenhum agendamento encontrado.</p>
        )}

        {!visitsLoading && visits.length > 0 && (
          <Carousel ariaLabel="Carrossel de agendamentos">
            {visits.map((visit) => (
              <VisitCard key={visit.id} visit={visit} layout="carousel" />
            ))}
          </Carousel>
        )}
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-forest-600">Meus Serviços</h2>
        </div>

        {servicesLoading && <Spinner />}
        {servicesError && (
          <p className="text-danger-600">{servicesError.non_field_errors || servicesError.detail}</p>
        )}

        {!servicesLoading && services.length === 0 && (
          <p className="text-gray-500">Nenhum serviço encontrado.</p>
        )}

        {!servicesLoading && services.length > 0 && (
          <Carousel ariaLabel="Carrossel de serviços">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} layout="carousel" />
            ))}
          </Carousel>
        )}
      </section>
    </div>
  );
}