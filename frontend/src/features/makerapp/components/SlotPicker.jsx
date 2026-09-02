import { useMemo, useState } from 'react';
import { useBusySlots } from '../hooks/useBusySlots';
import {
  generateDaySlots,
  isSlotAvailable,
  minAllowedStart,
  isBusinessDay,
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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Dia</p>
        <div className="flex flex-wrap gap-2">
          {candidateDates.map((date) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            return (
              <button
                type="button"
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
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
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => {
              const available = isSlotAvailable(slot, busySlots, minStart);
              const isSelected = value?.getTime() === slot.start.getTime();

              return (
                <button
                  type="button"
                  key={slot.start.toISOString()}
                  disabled={!available}
                  onClick={() => onChange(slot.start)}
                  className={`rounded-md border px-2 py-2 text-sm font-medium transition-colors ${
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
        {!isLoading && slots.every((slot) => !isSlotAvailable(slot, busySlots, minStart)) && (
          <p className="mt-2 text-sm text-gray-500">Nenhum horário disponível nesse dia.</p>
        )}
      </div>
    </div>
  );
}