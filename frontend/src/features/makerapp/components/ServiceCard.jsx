const SERVICE_TYPE_LABELS = {
  '3d_printing': 'Impressão 3D',
  'laser_cutting': 'Corte a Laser',
  'stamping': 'Estampagem',
};

function getServiceStatus(service) {
  if (service.is_closed || service.acceptance_status === 'closed') {
    return {
      key: 'fechado',
      label: 'Fechado',
      style: 'bg-slate-100 text-slate-700 border border-slate-200',
    };
  }
  if (service.acceptance_status === 'accepted') {
    return {
      key: 'em_andamento',
      label: 'Em andamento',
      style: 'bg-forest-100 text-forest-700 border border-forest-200',
    };
  }
  if (service.acceptance_status === 'rejected') {
    return {
      key: 'recusado',
      label: 'Recusado',
      style: 'bg-danger-100 text-danger-600 border border-danger-200',
    };
  }
  return {
    key: 'aguardando_avaliacao',
    label: 'Aguardando avaliação',
    style: 'bg-amber-100 text-amber-800 border border-amber-200',
  };
}

export function ServiceCard({ service }) {
  const status = getServiceStatus(service);
  const typeLabel = SERVICE_TYPE_LABELS[service.name] || service.name;
  const fileName = service.file ? service.file.split('/').pop() : null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white rounded-lg p-4 shadow-sm hover:border-forest-200 transition-colors">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-forest-600 font-semibold">
            Serviço
          </span>
          <span className="text-gray-300">•</span>
          <p className="text-base font-medium text-gray-900">{typeLabel}</p>
        </div>

        {service.requester_name && (
          <p className="text-sm text-gray-500">
            Solicitante: <span className="font-medium text-gray-700">{service.requester_name}</span>
          </p>
        )}

        <p className="text-sm text-gray-600 line-clamp-2">
          {service.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1 font-medium text-gray-700">
            Quantidade: <span className="text-forest-700 font-semibold">{service.quantity}</span>
          </span>

          {fileName && (
            <span className="inline-flex items-center gap-1 text-forest-600 truncate max-w-xs">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {service.file.startsWith('http') || service.file.startsWith('/') ? (
                <a
                  href={service.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline truncate"
                  title={fileName}
                >
                  {fileName}
                </a>
              ) : (
                <span className="truncate" title={fileName}>{fileName}</span>
              )}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center self-start sm:self-center shrink-0">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.style}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
}
