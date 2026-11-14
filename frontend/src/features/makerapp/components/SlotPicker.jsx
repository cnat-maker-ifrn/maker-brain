import { useMemo, useState } from 'react';
import { useBusySlots } from '../hooks/useBusySlots';
import {
  generateDaySlots,
  isSlotAvailable,
  minAllowedStart,
  isBusinessDay,
  rangesOverlap,
  BUSINESS_HOURS,
} from '@/frontLib/visitAvailability';

function formatTimeLabel(date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatSelectedDate(date) {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getInitialDate() {
  const min = minAllowedStart();
  const cursor = new Date(min);
  cursor.setHours(0, 0, 0, 0);

  while (
    !isBusinessDay(cursor) ||
    new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), BUSINESS_HOURS.endHour, 0, 0) <= min
  ) {
    cursor.setDate(cursor.getDate() + 1);
  }

  return cursor;
}

export function SlotPicker({ visitType, value, onChange }) {
  const minStart = useMemo(() => minAllowedStart(), []);

  const [selectedDate, setSelectedDate] = useState(() => {
    if (value instanceof Date && !isNaN(value)) {
      const d = new Date(value);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    return getInitialDate();
  });

  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const { busySlots, isLoading } = useBusySlots(selectedDate);

  const slots = useMemo(
    () => generateDaySlots(selectedDate, visitType),
    [selectedDate, visitType]
  );

  const blockReason = useMemo(() => {
    return busySlots.find((b) => b.reason)?.reason;
  }, [busySlots]);

  const isWholeDayClosed = useMemo(() => {
    return busySlots.some((b) => b.all_day);
  }, [busySlots]);

  const isAllSlotsUnavailable = useMemo(() => {
    return !isLoading && slots.length > 0 && slots.every((slot) => !isSlotAvailable(slot, busySlots, minStart));
  }, [isLoading, slots, busySlots, minStart]);

  const prevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isPrevDisabled = useMemo(() => {
    const minMonth = new Date(minStart.getFullYear(), minStart.getMonth(), 1);
    return currentMonth <= minMonth;
  }, [currentMonth, minStart]);

  const monthLabel = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d, 0, 0, 0, 0));
    }
    return days;
  }, [currentMonth]);

  const isDateSelectable = (date) => {
    if (!date) return false;
    if (!isBusinessDay(date)) return false;
    const dayEnd = new Date(date);
    dayEnd.setHours(BUSINESS_HOURS.endHour, 0, 0, 0);
    return dayEnd > minStart;
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Dia</p>
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold capitalize text-gray-800">
              {monthLabel}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                disabled={isPrevDisabled}
                aria-label="Mês anterior"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Próximo mês"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName) => (
              <span key={dayName} className="text-[10px] sm:text-[11px] font-semibold text-gray-400 py-1">
                {dayName}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="h-7 sm:h-8" />;
              }

              const selectable = isDateSelectable(date);
              const isSelected = isDateSelected(date);
              const dayNum = date.getDate();

              return (
                <button
                  type="button"
                  key={date.toISOString()}
                  disabled={!selectable}
                  onClick={() => setSelectedDate(date)}
                  className={`h-7 sm:h-8 text-xs font-medium rounded-lg transition-colors flex items-center justify-center ${
                    isSelected
                      ? 'bg-forest-600 text-white font-bold shadow-xs'
                      : selectable
                        ? 'bg-white text-gray-700 hover:bg-forest-100 hover:text-forest-700 border border-gray-200/80 shadow-2xs'
                        : 'text-gray-300 cursor-not-allowed bg-transparent'
                  }`}
                  title={
                    !isBusinessDay(date)
                      ? 'Fim de semana'
                      : !selectable
                        ? 'Data indisponível para agendamento'
                        : undefined
                  }
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-2.5 border-t border-gray-200/70 pt-2 text-xs text-gray-500">
              Dia selecionado:{' '}
              <span className="font-semibold text-forest-700 capitalize">
                {formatSelectedDate(selectedDate)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Horário</p>
        {isLoading ? (
          <p className="text-sm text-gray-400">Carregando horários...</p>
        ) : (
          <div className="grid grid-cols-2 min-[380px]:grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((slot) => {
              const available = isSlotAvailable(slot, busySlots, minStart);
              const isSelected = value?.getTime() === slot.start.getTime();

              const overlappingBlock = !available
                ? busySlots.find((busy) =>
                    rangesOverlap(slot.start, slot.end, new Date(busy.start), new Date(busy.end))
                  )
                : null;

              const tooltip = overlappingBlock?.reason
                ? `Indisponível: ${overlappingBlock.reason}`
                : !available
                ? 'Horário indisponível'
                : undefined;

              return (
                <button
                  type="button"
                  key={slot.start.toISOString()}
                  disabled={!available}
                  onClick={() => onChange(slot.start)}
                  title={tooltip}
                  className={`rounded-md border px-2 py-2 text-xs sm:text-sm font-medium transition-colors ${
                    !available
                      ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
                      : isSelected
                        ? 'border-forest-500 bg-forest-600 text-white'
                        : 'border-forest-200 bg-forest-50 text-forest-700 hover:border-forest-400 hover:bg-forest-100'
                  }`}
                >
                  {formatTimeLabel(slot.start)}
                </button>
              );
            })}
          </div>
        )}

        {isAllSlotsUnavailable && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs sm:text-sm text-amber-800">
            <p className="font-semibold">
              {isWholeDayClosed
                ? '🔒 Laboratório fechado neste dia.'
                : 'Nenhum horário disponível nesse dia.'}
            </p>
            {blockReason && (
              <p className="mt-1 text-xs text-amber-700">
                <strong>Motivo:</strong> {blockReason}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
