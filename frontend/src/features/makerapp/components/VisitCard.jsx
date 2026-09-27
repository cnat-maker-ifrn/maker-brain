const VISIT_TYPE_LABELS = {
  fast: 'Rápida',
  childish: 'Infantil',
  technical: 'Técnica',
};

function getVisitStatus(visit) {
  if (visit.is_visit_closed) {
    return {
      key: 'fechado',
      label: 'Fechada',
      style: 'bg-slate-100 text-slate-700 border border-slate-200',
    };
  }
  if (visit.acceptance_status === 'accepted') {
    return {
      key: 'em_andamento',
      label: 'Em andamento',
      style: 'bg-forest-100 text-forest-700 border border-forest-200',
    };
  }
  if (visit.acceptance_status === 'rejected') {
    return {
      key: 'recusado',
      label: 'Recusada',
      style: 'bg-danger-100 text-danger-600 border border-danger-200',
    };
  }
  return {
    key: 'aguardando_avaliacao',
    label: 'Aguardando avaliação',
    style: 'bg-amber-100 text-amber-800 border border-amber-200',
  };
}

function formatSchedulingDate(isoDate) {
  return new Date(isoDate).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function VisitCard({ visit, onAccept, onReject, isProcessing }) {
  const showActions = (onAccept || onReject) && visit.acceptance_status === 'pending';
  const status = getVisitStatus(visit);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white rounded-lg p-4 shadow-sm hover:border-forest-200 transition-colors">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-forest-600 font-semibold">
            Visita
          </span>
          <span className="text-gray-300">•</span>
          <p className="text-base font-medium text-gray-900">
            {VISIT_TYPE_LABELS[visit.visit_type] || visit.visit_type}
          </p>
        </div>

        {visit.requester_name && (
          <p className="text-sm text-gray-500">
            Solicitante: <span className="font-medium text-gray-700">{visit.requester_name}</span>
          </p>
        )}

        <p className="text-sm text-gray-500">
          Data: <span className="text-gray-700 font-medium">{formatSchedulingDate(visit.scheduling_date)}</span>
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>
            Visitantes previstos: <span className="font-semibold text-gray-700">{visit.forecast_number_of_visitors}</span>
          </span>
          {visit.is_visit_closed && visit.real_number_of_visitors !== null && visit.real_number_of_visitors !== undefined && (
            <span>
              Visitantes reais: <span className="font-semibold text-forest-700">{visit.real_number_of_visitors}</span>
            </span>
          )}
          {visit.school_name && (
            <span>Escola: <span className="font-medium text-gray-700">{visit.school_name}</span></span>
          )}
          {visit.company_name && (
            <span>Empresa: <span className="font-medium text-gray-700">{visit.company_name}</span></span>
          )}
          {visit.cnat_department && (
            <span>Departamento: <span className="font-medium text-gray-700 uppercase">{visit.cnat_department}</span></span>
          )}
        </div>

        {visit.description && (
          <p className="text-xs text-gray-600 pt-1 line-clamp-2">
            {visit.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${status.style}`}
        >
          {status.label}
        </span>

        {showActions ? (
          <div className="flex gap-2">
            {onAccept ? (
              <button
                onClick={() => onAccept(visit.id)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded bg-forest-600 text-white font-medium hover:bg-forest-500 disabled:opacity-50"
              >
                Aceitar
              </button>
            ) : null}
            {onReject ? (
              <button
                onClick={() => onReject(visit.id)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded border border-danger-500 text-danger-600 hover:bg-danger-50 disabled:opacity-50"
              >
                Rejeitar
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}