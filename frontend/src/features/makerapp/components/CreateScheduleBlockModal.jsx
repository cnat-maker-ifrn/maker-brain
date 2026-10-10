import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isBusinessDay } from '@/frontLib/visitAvailability';

const TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

function formatDateBR(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function CreateScheduleBlockModal({ isOpen, onClose, onCreated, isSubmitting, error }) {
  const [mode, setMode] = useState('range'); // 'range' | 'multi'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [onlyBusinessDays, setOnlyBusinessDays] = useState(true);

  // Multi-date selection
  const [specificDates, setSpecificDates] = useState([]);
  const [dateInput, setDateInput] = useState('');

  // Time & details
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  // Mini-calendar state for multi-date selection
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Calculate dates in range
  const rangeDates = useMemo(() => {
    if (!startDate || !endDate) return [];
    if (endDate < startDate) return [];

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const dates = [];
    const curr = new Date(start);

    while (curr <= end) {
      if (!onlyBusinessDays || isBusinessDay(curr)) {
        dates.push(toYMD(curr));
      }
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  }, [startDate, endDate, onlyBusinessDays]);

  const effectiveDates = mode === 'range' ? rangeDates : specificDates;

  if (!isOpen) return null;

  const handleAddDateInput = () => {
    if (!dateInput) return;
    if (!specificDates.includes(dateInput)) {
      setSpecificDates((prev) => [...prev, dateInput].sort());
    }
    setDateInput('');
  };

  const handleToggleCalendarDate = (dateYMD) => {
    setSpecificDates((prev) => {
      if (prev.includes(dateYMD)) {
        return prev.filter((d) => d !== dateYMD);
      }
      return [...prev, dateYMD].sort();
    });
  };

  const handleRemoveSpecificDate = (dToRemove) => {
    setSpecificDates((prev) => prev.filter((d) => d !== dToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (effectiveDates.length === 0) {
      setValidationError('Selecione pelo menos uma data para tornar indisponível.');
      return;
    }

    if (!allDay) {
      if (!startTime || !endTime) {
        setValidationError('Informe os horários de início e término.');
        return;
      }
      if (endTime <= startTime) {
        setValidationError('O horário de término deve ser posterior ao horário de início.');
        return;
      }
    }

    // Build payload with ISO datetimes for accurate client timezone preservation
    const blocksPayload = effectiveDates.map((dateStr) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      let startDt, endDt;

      if (allDay) {
        startDt = new Date(y, m - 1, d, 0, 0, 0, 0);
        endDt = new Date(y, m - 1, d, 23, 59, 59, 999);
      } else {
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        startDt = new Date(y, m - 1, d, sh, sm, 0, 0);
        endDt = new Date(y, m - 1, d, eh, em, 0, 0);
      }

      return {
        start_datetime: startDt.toISOString(),
        end_datetime: endDt.toISOString(),
        all_day: allDay,
        reason: reason.trim(),
      };
    });

    const success = await onCreated(blocksPayload);
    if (success) {
      // Reset form
      setStartDate('');
      setEndDate('');
      setSpecificDates([]);
      setReason('');
      setAllDay(true);
      onClose();
    }
  };

  // Mini-calendar generation
  const calendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      days.push(toYMD(dt));
    }
    return days;
  };

  const prevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const monthLabel = calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 overflow-y-auto">
      <div className="relative my-auto w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 sm:p-6 md:p-8 shadow-xl">
        <div className="mb-4 sm:mb-6 flex items-start justify-between border-b border-gray-100 pb-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-forest-600">Gestão de Agenda</p>
            <h2 className="mt-1 text-lg sm:text-xl font-semibold text-gray-900">
              Tornar dias e horários indisponíveis
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Bloqueie datas em que o laboratório estará fechado para visitas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-forest-500"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mode Selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Como deseja selecionar os dias?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('range')}
                className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${
                  mode === 'range'
                    ? 'border-forest-600 bg-forest-50 text-forest-700 font-semibold'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                📅 Intervalo de datas
              </button>
              <button
                type="button"
                onClick={() => setMode('multi')}
                className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${
                  mode === 'multi'
                    ? 'border-forest-600 bg-forest-50 text-forest-700 font-semibold'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                🗓️ Múltiplas datas específicas
              </button>
            </div>
          </div>

          {/* Range Mode */}
          {mode === 'range' && (
            <div className="bg-gray-50 p-3.5 sm:p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Data inicial"
                  id="range-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  label="Data final"
                  id="range-end-date"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="only-business-days"
                  checked={onlyBusinessDays}
                  onChange={(e) => setOnlyBusinessDays(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-forest-600 focus:ring-forest-500"
                />
                <label htmlFor="only-business-days" className="text-xs sm:text-sm text-gray-700">
                  Bloquear apenas dias úteis (segunda a sexta)
                </label>
              </div>

              {startDate && endDate && (
                <div className="text-xs text-forest-700 font-medium">
                  {rangeDates.length > 0 ? (
                    <span>
                      ✓ <strong>{rangeDates.length} dia(s)</strong> serão bloqueados ({formatDateBR(startDate)} até {formatDateBR(endDate)}).
                    </span>
                  ) : (
                    <span className="text-danger-600">A data final deve ser posterior à data inicial.</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Multi-Date Selection Mode */}
          {mode === 'multi' && (
            <div className="bg-gray-50 p-3.5 sm:p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-gray-700 capitalize">
                  {monthLabel}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1 rounded text-gray-600 hover:bg-gray-200 text-xs font-bold"
                    aria-label="Mês anterior"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1 rounded text-gray-600 hover:bg-gray-200 text-xs font-bold"
                    aria-label="Próximo mês"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName) => (
                  <span key={dayName} className="text-[10px] font-semibold text-gray-400 py-1">
                    {dayName}
                  </span>
                ))}
                {calendarDays().map((dStr, idx) => {
                  if (!dStr) {
                    return <div key={`empty-${idx}`} className="h-7" />;
                  }
                  const isSelected = specificDates.includes(dStr);
                  const dayNum = Number(dStr.split('-')[2]);
                  return (
                    <button
                      type="button"
                      key={dStr}
                      onClick={() => handleToggleCalendarDate(dStr)}
                      className={`h-7 sm:h-8 text-xs font-medium rounded transition-colors ${
                        isSelected
                          ? 'bg-forest-600 text-white font-bold'
                          : 'bg-white text-gray-700 hover:bg-forest-100 hover:text-forest-700'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>

              {/* Or Manual Date Picker */}
              <div className="flex gap-2 items-end pt-2 border-t border-gray-200">
                <div className="flex-1">
                  <Input
                    label="Ou adicione por data"
                    id="manual-date-picker"
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddDateInput}
                  disabled={!dateInput}
                  className="py-2.5 px-3 text-xs"
                >
                  Adicionar
                </Button>
              </div>

              {/* Selected Dates Chips */}
              {specificDates.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{specificDates.length} data(s) selecionada(s):</span>
                    <button
                      type="button"
                      onClick={() => setSpecificDates([])}
                      className="text-danger-600 hover:underline"
                    >
                      Limpar todas
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white rounded border border-gray-200">
                    {specificDates.map((dStr) => (
                      <span
                        key={dStr}
                        className="inline-flex items-center gap-1 bg-forest-50 text-forest-700 border border-forest-200 px-2 py-0.5 rounded text-xs"
                      >
                        {formatDateBR(dStr)}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecificDate(dStr)}
                          className="hover:text-danger-600 font-bold ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Time & Duration Controls */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-800">Dia inteiro</p>
                <p className="text-xs text-gray-500">
                  Laboratório completamente fechado nos dias selecionados.
                </p>
              </div>
              <input
                type="checkbox"
                id="all-day-toggle"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-forest-600 focus:ring-forest-500 cursor-pointer"
              />
            </div>

            {/* Specific Hours */}
            {!allDay && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-forest-50/50 rounded-lg border border-forest-200">
                <div>
                  <label htmlFor="start-time-select" className="text-xs font-medium text-gray-700 block mb-1">
                    Horário inicial
                  </label>
                  <select
                    id="start-time-select"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-forest-500"
                  >
                    {TIME_OPTIONS.slice(0, -1).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="end-time-select" className="text-xs font-medium text-gray-700 block mb-1">
                    Horário final
                  </label>
                  <select
                    id="end-time-select"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-forest-500"
                  >
                    {TIME_OPTIONS.slice(1).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Reason */}
            <Input
              label="Motivo do fechamento (opcional)"
              id="block-reason"
              placeholder="Ex: Feriado Nacional, Manutenção preventiva, Recesso acadêmico"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              hint="O motivo será exibido aos usuários que tentarem agendar nesses dias."
            />
          </div>

          {/* Validation & Server Error Display */}
          {(validationError || error) && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-xs">
              {validationError || error.detail || error.non_field_errors || Object.values(error)[0]}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={effectiveDates.length === 0}
            >
              Bloquear {effectiveDates.length > 0 ? `${effectiveDates.length} dia(s)` : 'agenda'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
