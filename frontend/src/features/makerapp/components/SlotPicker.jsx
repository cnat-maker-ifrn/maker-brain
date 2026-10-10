import { useMemo, useState } from 'react';
import { useBusySlots } from '../hooks/useBusySlots';
import {
  generateDaySlots,
  isSlotAvailable,
  minAllowedStart,
  isBusinessDay,
  rangesOverlap,
} from '@/frontLib/visitAvailability';

const DAYS_TO_SHOW = 10;

function formatDateLabel(date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function formatTimeLabel(date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function buildCandidateDates() {
  const dates = [];
  const cursor = new Date(minAllowedStart());
  cursor.setHours(0, 0, 0, 0);

  while (dates.length < DAYS_TO_SHOW) {
    if (isBusinessDay(cursor)) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function SlotPicker({ visitType, value, onChange }) {
  const candidateDates = useMemo(() => buildCandidateDates(), []);
  const [selectedDate, setSelectedDate] = useState(candidateDates[0]);
  const { busySlots, isLoading } = useBusySlots(selectedDate);
  const minStart = useMemo(() => minAllowedStart(), []);

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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Dia</p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mb-1 sm:flex-wrap">
          {candidateDates.map((date) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            return (
              <button
                type="button"
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`shrink-0 rounded-md border px-3 py-1.5 text-xs sm:text-sm font-medium capitalize transition-colors ${
                  isSelected
                    ? 'border-forest-500 bg-forest-600 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-forest-400 hover:text-forest-600'
                }`}
              >
                {formatDateLabel(date)}
              </button>
            );
          })}
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