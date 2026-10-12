function formatDateTimeBR(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTimeBR(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ScheduleBlockCard({ block, isSelected, onToggleSelect, onDelete, isDeleting }) {
  const isAllDay = block.all_day;
  const dateLabel = formatDateTimeBR(block.start_datetime);
  const timeLabel = isAllDay
    ? 'Dia inteiro'
    : `${formatTimeBR(block.start_datetime)} às ${formatTimeBR(block.end_datetime)}`;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border bg-white shadow-xs transition-all ${
        isSelected ? 'border-forest-500 bg-forest-50/20 ring-1 ring-forest-500' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(block.id)}
          className="mt-1 sm:mt-0 h-4 w-4 rounded border-gray-300 text-forest-600 focus:ring-forest-500 cursor-pointer"
          aria-label={`Selecionar bloqueio do dia ${dateLabel}`}
        />

        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm sm:text-base capitalize">
              {dateLabel}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isAllDay
                  ? 'bg-forest-100 text-forest-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isAllDay ? '🔒 Dia inteiro' : `⏱️ ${timeLabel}`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            {block.reason ? (
              <span className="text-gray-700 font-medium italic">
                "{block.reason}"
              </span>
            ) : (
              <span className="text-gray-400">Sem motivo especificado</span>
            )}
            {block.created_by_name && (
              <span>• Cadastrado por: {block.created_by_name}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end sm:justify-center">
        <button
          type="button"
          onClick={() => onDelete(block.id)}
          disabled={isDeleting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-danger-600 hover:bg-danger-50 hover:text-danger-700 rounded-lg transition-colors disabled:opacity-50"
          title="Desbloquear este horário"
        >
          {isDeleting ? (
            <span className="h-3 w-3 animate-spin rounded-full border border-danger-600 border-t-transparent" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
          <span>Desbloquear</span>
        </button>
      </div>
    </div>
  );
}
