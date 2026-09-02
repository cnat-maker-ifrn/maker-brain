const VISIT_TYPE_LABELS = {
  fast: 'Rápida',
  childish: 'Infantil',
  technical: 'Técnica',
};

const ACCEPTANCE_STATUS_LABELS = {
  pending: 'Pendente',
  accepted: 'Aceita',
  rejected: 'Rejeitada',
};

const ACCEPTANCE_STATUS_STYLES = {
  pending: 'bg-gray-100 text-gray-600',
  accepted: 'bg-forest-100 text-forest-700',
  rejected: 'bg-danger-100 text-danger-600',
};

function formatSchedulingDate(isoDate) {
  return new Date(isoDate).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function VisitCard({ visit, onAccept, onReject, isProcessing }) {
  const showActions = (onAccept || onReject) && visit.acceptance_status === 'pending';

  return (
    <div className="flex items-center justify-between border border-gray-200 bg-white rounded-lg p-4 shadow-sm">
      <div>
        <p className="text-forest-700 font-medium">
          Visita {VISIT_TYPE_LABELS[visit.visit_type]}
        </p>
        {visit.requester_name ? (
          <p className="text-sm text-gray-500">Solicitante: {visit.requester_name}</p>
        ) : null}
        <p className="text-sm text-gray-500">{formatSchedulingDate(visit.scheduling_date)}</p>
        <p className="text-sm text-gray-500">
          Visitantes previstos: {visit.forecast_number_of_visitors}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${ACCEPTANCE_STATUS_STYLES[visit.acceptance_status]}`}
        >
          {ACCEPTANCE_STATUS_LABELS[visit.acceptance_status]}
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