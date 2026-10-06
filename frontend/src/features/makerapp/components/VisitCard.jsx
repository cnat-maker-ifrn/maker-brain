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

export function VisitCard({ visit, onAccept, onReject, isProcessing, layout = 'list', className = '' }) {
  const showActions = (onAccept || onReject) && visit.acceptance_status === 'pending';
  const status = getVisitStatus(visit);

  if (layout === 'carousel') {
    return (
      <div className={`flex flex-col justify-between border border-gray-200 bg-white rounded-xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-forest-300 transition-all h-full ${className}`}>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-xs uppercase tracking-wider text-forest-600 font-semibold">
                Visita
              </span>
              <span className="text-gray-300">•</span>
              <p className="text-base font-medium text-gray-900 truncate">
                {VISIT_TYPE_LABELS[visit.visit_type] || visit.visit_type}
              </p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${status.style}`}>
              {status.label}
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            {visit.requester_name && (
              <p className="text-xs sm:text-sm text-gray-500">
                Solicitante: <span className="font-medium text-gray-700">{visit.requester_name}</span>
              </p>
            )}
            <p className="text-xs sm:text-sm text-gray-500">
              Data: <span className="text-gray-700 font-medium">{formatSchedulingDate(visit.scheduling_date)}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 pt-1 border-t border-gray-100">
            <span>
              Previstos: <span className="font-semibold text-gray-700">{visit.forecast_number_of_visitors}</span>
            </span>
            {visit.is_visit_closed && visit.real_number_of_visitors !== null && visit.real_number_of_visitors !== undefined && (
              <span>
                Reais: <span className="font-semibold text-forest-700">{visit.real_number_of_visitors}</span>
              </span>
            )}
            {visit.school_name && (
              <span>Escola: <span className="font-medium text-gray-700">{visit.school_name}</span></span>
            )}
            {visit.company_name && (
              <span>Empresa: <span className="font-medium text-gray-700">{visit.company_name}</span></span>
            )}
            {visit.cnat_department && (
              <span>Dep: <span className="font-medium text-gray-700 uppercase">{visit.cnat_department}</span></span>
            )}
          </div>

          {visit.description && (
            <p className="text-xs text-gray-600 line-clamp-3 break-words pt-0.5">
              {visit.description}
            </p>
          )}
        </div>

        {showActions ? (
          <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gray-100">
            {onAccept && (
              <button
                onClick={() => onAccept(visit.id)}
                disabled={isProcessing}
                className="flex-1 px-3 py-1.5 rounded-md bg-forest-600 text-white text-xs font-medium hover:bg-forest-500 disabled:opacity-50 transition-colors text-center"
              >
                Aceitar
              </button>
            )}
            {onReject && (
              <button
                onClick={() => onReject(visit.id)}
                disabled={isProcessing}
                className="flex-1 px-3 py-1.5 rounded-md border border-danger-500 text-danger-600 hover:bg-danger-50 disabled:opacity-50 text-xs font-medium transition-colors text-center"
              >
                Rejeitar
              </button>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white rounded-lg p-4 shadow-sm hover:border-forest-200 transition-colors ${className}`}>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-forest-600 font-semibold">
            Visita
          </span>
          <span className="text-gray-300">•</span>
          <p className="text-base font-medium text-gray-900 truncate">
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
          <p className="text-xs text-gray-600 pt-1 line-clamp-2 break-words">
            {visit.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 self-stretch sm:self-center shrink-0 border-t border-gray-100 pt-3 sm:border-t-0 sm:pt-0">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${status.style}`}
        >
          {status.label}
        </span>

        {showActions ? (
          <div className="flex items-center gap-2">
            {onAccept ? (
              <button
                onClick={() => onAccept(visit.id)}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-md bg-forest-600 text-white text-xs sm:text-sm font-medium hover:bg-forest-500 disabled:opacity-50 transition-colors"
              >
                Aceitar
              </button>
            ) : null}
            {onReject ? (
              <button
                onClick={() => onReject(visit.id)}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-md border border-danger-500 text-danger-600 hover:bg-danger-50 disabled:opacity-50 text-xs sm:text-sm font-medium transition-colors"
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