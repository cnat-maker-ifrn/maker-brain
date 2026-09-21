import { useState, useMemo } from 'react';
import { useUserProfile } from '@/features/makerauth';
import {
  useMyVisits,
  useMyServices,
  VisitCard,
  ServiceCard,
  CreateVisitButton,
  CreateServiceButton,
} from '@/features/makerapp';
import { Spinner } from '@/components/ui/Spinner';

const BOND_LABELS = {
  student: 'Aluno(a)',
  teacher: 'Professor(a)',
  public_servant: 'Servidor(a) Público(a)',
  external: 'Externo',
};

function formatCpf(cpf) {
  if (!cpf || cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

function getItemStatusKey(item, isService = false) {
  if (isService) {
    if (item.is_closed || item.acceptance_status === 'closed') return 'fechado';
    if (item.acceptance_status === 'accepted') return 'em_andamento';
    if (item.acceptance_status === 'rejected') return 'recusado';
    return 'aguardando_avaliacao';
  } else {
    if (item.is_visit_closed) return 'fechado';
    if (item.acceptance_status === 'accepted') return 'em_andamento';
    if (item.acceptance_status === 'rejected') return 'recusado';
    return 'aguardando_avaliacao';
  }
}

export default function ProfilePage() {
  const { profile, isLoading: profileLoading } = useUserProfile();
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

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'visits' | 'services'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'aguardando_avaliacao' | 'em_andamento' | 'fechado' | 'recusado'

  const handleCreated = () => {
    refetchVisits();
    refetchServices();
  };

  const displayName = profile?.name || profile?.email || 'Usuário';
  const initials = displayName ? displayName.charAt(0).toUpperCase() : '?';

  // Metrics calculation
  const metrics = useMemo(() => {
    const allVisits = visits || [];
    const allServices = services || [];

    let aguardando = 0;
    let emAndamento = 0;
    let fechados = 0;
    let recusados = 0;

    allVisits.forEach((v) => {
      const key = getItemStatusKey(v, false);
      if (key === 'fechado') fechados++;
      else if (key === 'em_andamento') emAndamento++;
      else if (key === 'recusado') recusados++;
      else aguardando++;
    });

    allServices.forEach((s) => {
      const key = getItemStatusKey(s, true);
      if (key === 'fechado') fechados++;
      else if (key === 'em_andamento') emAndamento++;
      else if (key === 'recusado') recusados++;
      else aguardando++;
    });

    return {
      total: allVisits.length + allServices.length,
      visitsCount: allVisits.length,
      servicesCount: allServices.length,
      aguardando,
      emAndamento,
      fechados,
      recusados,
    };
  }, [visits, services]);

  // Filtered items
  const filteredVisits = useMemo(() => {
    if (!visits) return [];
    if (statusFilter === 'all') return visits;
    return visits.filter((v) => getItemStatusKey(v, false) === statusFilter);
  }, [visits, statusFilter]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (statusFilter === 'all') return services;
    return services.filter((s) => getItemStatusKey(s, true) === statusFilter);
  }, [services, statusFilter]);

  const isLoading = profileLoading || visitsLoading || servicesLoading;
  const hasError = visitsError || servicesError;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-forest-100 text-3xl font-bold text-forest-700 shadow-inner">
            {initials}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold text-gray-900">{displayName}</h1>
              {profile?.bond && (
                <span className="rounded-md bg-forest-50 px-2.5 py-0.5 text-xs font-medium text-forest-700 border border-forest-200">
                  {BOND_LABELS[profile.bond] || profile.bond}
                </span>
              )}
              {profile?.groups?.map((group) => (
                <span
                  key={group}
                  className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 border border-gray-200"
                >
                  {group}
                </span>
              ))}
            </div>

            <p className="text-sm text-gray-500">{profile?.email}</p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 pt-2 text-xs text-gray-600">
              {profile?.cpf && (
                <div>
                  <span className="font-semibold text-gray-500">CPF: </span>
                  <span>{formatCpf(profile.cpf)}</span>
                </div>
              )}
              {profile?.cellphone && (
                <div>
                  <span className="font-semibold text-gray-500">Telefone: </span>
                  <span>{formatPhone(profile.cellphone)}</span>
                </div>
              )}
              {profile?.enrollment && (
                <div>
                  <span className="font-semibold text-gray-500">Matrícula: </span>
                  <span className="font-mono">{profile.enrollment}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <CreateServiceButton onCreated={handleCreated} />
            <CreateVisitButton onCreated={handleCreated} />
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`rounded-lg border p-3.5 text-left transition-all ${
            statusFilter === 'all'
              ? 'border-forest-500 bg-forest-50 ring-2 ring-forest-500/20'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-xs font-medium text-gray-500">Total de Solicitações</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{metrics.total}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('aguardando_avaliacao')}
          className={`rounded-lg border p-3.5 text-left transition-all ${
            statusFilter === 'aguardando_avaliacao'
              ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-xs font-medium text-amber-700">Aguardando Avaliação</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">{metrics.aguardando}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('em_andamento')}
          className={`rounded-lg border p-3.5 text-left transition-all ${
            statusFilter === 'em_andamento'
              ? 'border-forest-500 bg-forest-50 ring-2 ring-forest-500/20'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-xs font-medium text-forest-700">Em Andamento</p>
          <p className="mt-1 text-2xl font-bold text-forest-800">{metrics.emAndamento}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('fechado')}
          className={`rounded-lg border p-3.5 text-left transition-all ${
            statusFilter === 'fechado'
              ? 'border-slate-500 bg-slate-50 ring-2 ring-slate-500/20'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-xs font-medium text-slate-700">Fechados</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{metrics.fechados}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('recusado')}
          className={`col-span-2 sm:col-span-1 rounded-lg border p-3.5 text-left transition-all ${
            statusFilter === 'recusado'
              ? 'border-danger-500 bg-danger-50 ring-2 ring-danger-500/20'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-xs font-medium text-danger-700">Recusados</p>
          <p className="mt-1 text-2xl font-bold text-danger-800">{metrics.recusados}</p>
        </button>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        {/* Type Tabs */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-forest-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas ({metrics.total})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('visits')}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'visits'
                ? 'bg-forest-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Visitas ({metrics.visitsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-forest-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Serviços ({metrics.servicesCount})
          </button>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-gray-500 font-medium mr-1">Filtrar estado:</span>
          {[
            { key: 'all', label: 'Todos' },
            { key: 'aguardando_avaliacao', label: 'Aguardando avaliação' },
            { key: 'em_andamento', label: 'Em andamento' },
            { key: 'fechado', label: 'Fechado' },
            { key: 'recusado', label: 'Recusado' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key)}
              className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
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

      {/* Error state */}
      {hasError && (
        <div className="rounded-md border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">
          {visitsError?.non_field_errors || visitsError?.detail || servicesError?.non_field_errors || servicesError?.detail || 'Ocorreu um erro ao carregar as solicitações.'}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-12 text-center">
          <Spinner />
          <p className="mt-2 text-sm text-gray-500">Carregando suas solicitações...</p>
        </div>
      )}

      {/* Content Lists */}
      {!isLoading && (
        <div className="space-y-6">
          {/* Visits Section */}
          {(activeTab === 'all' || activeTab === 'visits') && (
            <div className="space-y-3">
              {activeTab === 'all' && (
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Visitas Agendadas ({filteredVisits.length})
                  </h2>
                </div>
              )}

              {filteredVisits.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                  {visits.length === 0
                    ? 'Nenhuma visita solicitada até o momento.'
                    : 'Nenhuma visita encontrada para o filtro selecionado.'}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredVisits.map((visit) => (
                    <VisitCard key={visit.id} visit={visit} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Services Section */}
          {(activeTab === 'all' || activeTab === 'services') && (
            <div className="space-y-3">
              {activeTab === 'all' && (
                <div className="flex items-center justify-between pt-2">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Serviços Solicitados ({filteredServices.length})
                  </h2>
                </div>
              )}

              {filteredServices.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                  {services.length === 0
                    ? 'Nenhum serviço solicitado até o momento.'
                    : 'Nenhum serviço encontrado para o filtro selecionado.'}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
