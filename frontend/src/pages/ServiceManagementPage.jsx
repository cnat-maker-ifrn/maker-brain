import { useState, useMemo } from 'react';
import { useServiceManagement, ServiceCard } from '@/features/makerapp';
import { Spinner } from '@/components/ui/Spinner';

export default function ServiceManagementPage() {
  const {
    services,
    isLoading,
    error,
    processingId,
    accept,
    reject,
    complete,
    cancel,
  } = useServiceManagement();

  const [statusFilter, setStatusFilter] = useState('all');

  const filteredServices = useMemo(() => {
    if (statusFilter === 'all') return services;
    if (statusFilter === 'concluido') {
      return services.filter(
        (s) => s.is_completed || s.is_closed || s.acceptance_status === 'closed'
      );
    }
    if (statusFilter === 'em_andamento') {
      return services.filter(
        (s) => s.acceptance_status === 'accepted' && !s.is_completed && !s.is_closed
      );
    }
    if (statusFilter === 'recusado') {
      return services.filter((s) => s.acceptance_status === 'rejected');
    }
    if (statusFilter === 'aguardando_avaliacao') {
      return services.filter((s) => s.acceptance_status === 'pending');
    }
    return services;
  }, [services, statusFilter]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-forest-600">
          Gerenciamento de Serviços
        </h1>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { key: 'all', label: `Todos (${services.length})` },
            {
              key: 'aguardando_avaliacao',
              label: `Aguardando avaliação (${
                services.filter((s) => s.acceptance_status === 'pending').length
              })`,
            },
            {
              key: 'em_andamento',
              label: `Em andamento (${
                services.filter(
                  (s) => s.acceptance_status === 'accepted' && !s.is_completed && !s.is_closed
                ).length
              })`,
            },
            {
              key: 'concluido',
              label: `Concluídos (${
                services.filter(
                  (s) => s.is_completed || s.is_closed || s.acceptance_status === 'closed'
                ).length
              })`,
            },
            {
              key: 'recusado',
              label: `Recusados (${
                services.filter((s) => s.acceptance_status === 'rejected').length
              })`,
            },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key)}
              className={`whitespace-nowrap rounded-full px-3 py-1 font-medium transition-colors ${
                statusFilter === item.key
                  ? 'bg-forest-100 text-forest-800 font-semibold ring-1 ring-forest-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <Spinner />}
      {error && <p className="text-danger-600 mb-4">{error.non_field_errors || error.detail}</p>}

      {!isLoading && filteredServices.length === 0 && (
        <p className="text-gray-500">
          {services.length === 0
            ? 'Nenhum serviço cadastrado.'
            : 'Nenhum serviço encontrado para este filtro.'}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onAccept={accept}
            onReject={reject}
            onComplete={complete}
            onCancel={cancel}
            isProcessing={processingId === service.id}
          />
        ))}
      </div>
    </>
  );
}
