export const VISIT_CONSTRAINTS = {
  fast: { maxDurationMinutes: 20, maxVisitors: 25 },
  childish: { maxDurationMinutes: 30, maxVisitors: 20 },
  technical: { maxDurationMinutes: 30, maxVisitors: 25 },
};

export const MIN_SCHEDULING_ADVANCE_DAYS = 2;

export const BUSINESS_HOURS = { startHour: 8, endHour: 18 };
export const SLOT_STEP_MINUTES = 30;

export function isBusinessDay(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

export function minAllowedStart(now = new Date()) {
  const min = new Date(now);
  min.setDate(min.getDate() + MIN_SCHEDULING_ADVANCE_DAYS);
  return min;
}

export function generateDaySlots(date, visitType) {
  const duration = VISIT_CONSTRAINTS[visitType]?.maxDurationMinutes ?? 30;
  const slots = [];

  for (
    let minutes = BUSINESS_HOURS.startHour * 60;
    minutes + duration <= BUSINESS_HOURS.endHour * 60;
    minutes += SLOT_STEP_MINUTES
  ) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    start.setMinutes(minutes);

    const end = new Date(start);
    end.setMinutes(start.getMinutes() + duration);

    slots.push({ start, end });
  }

  return slots;
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export function isSlotAvailable(slot, busySlots, minStart = minAllowedStart()) {
  if (slot.start < minStart) return false;

  return !busySlots.some((busy) =>
    rangesOverlap(slot.start, slot.end, new Date(busy.start), new Date(busy.end))
  );
}