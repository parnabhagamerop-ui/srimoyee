import { DailyLog, CycleSettings, CyclePrediction } from './types';

// Helper to format date object to YYYY-MM-DD
export function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Get Date object from YYYY-MM-DD string
export function parseDateStr(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Calculate cycle predictions and current phase
export function calculateCyclePrediction(
  logs: DailyLog[],
  settings: CycleSettings
): CyclePrediction {
  const { cycleLength, periodLength } = settings;

  // Find all flow start dates
  const flowDates = logs
    .filter(log => log.flow && log.flow !== 'none')
    .map(log => log.dateStr)
    .sort();

  let lastPeriodStartStr = '';

  if (flowDates.length > 0) {
    // Find the actual start dates of continuous blocks
    const startDates: string[] = [];
    for (let i = 0; i < flowDates.length; i++) {
      const current = parseDateStr(flowDates[i]);
      if (i === 0) {
        startDates.push(flowDates[i]);
      } else {
        const prev = parseDateStr(flowDates[i - 1]);
        const diffDays = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 2) {
          // If difference is more than 2 days, it's a new period cycle
          startDates.push(flowDates[i]);
        }
      }
    }
    lastPeriodStartStr = startDates[startDates.length - 1];
  } else {
    // Fallback: 12 days ago
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 12);
    lastPeriodStartStr = formatDateStr(defaultStart);
  }

  const lastPeriodStart = parseDateStr(lastPeriodStartStr);

  // Predictions are calculated from lastPeriodStart
  const nextPeriodStart = new Date(lastPeriodStart);
  nextPeriodStart.setDate(lastPeriodStart.getDate() + cycleLength);
  const nextPeriodStartDate = formatDateStr(nextPeriodStart);

  // Ovulation: typically 14 days before next period start
  const ovulation = new Date(nextPeriodStart);
  ovulation.setDate(nextPeriodStart.getDate() - 14);
  const ovulationDate = formatDateStr(ovulation);

  // Fertile Window: 5 days before ovulation + ovulation day
  const fertileStart = new Date(ovulation);
  fertileStart.setDate(ovulation.getDate() - 5);
  const fertileEnd = new Date(ovulation);
  fertileEnd.setDate(ovulation.getDate() + 1);

  const fertileWindowStart = formatDateStr(fertileStart);
  const fertileWindowEnd = formatDateStr(fertileEnd);

  // Current Phase determination
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffFromStart = Math.floor((today.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
  const currentCycleDay = ((diffFromStart % cycleLength) + cycleLength) % cycleLength;

  let phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' = 'follicular';
  let phaseProgress = 0;

  if (currentCycleDay < periodLength) {
    phase = 'menstrual';
    phaseProgress = (currentCycleDay / periodLength) * 100;
  } else if (currentCycleDay < 12) {
    phase = 'follicular';
    phaseProgress = ((currentCycleDay - periodLength) / (12 - periodLength)) * 100;
  } else if (currentCycleDay < 16) {
    phase = 'ovulatory';
    phaseProgress = ((currentCycleDay - 12) / 4) * 100;
  } else {
    phase = 'luteal';
    phaseProgress = ((currentCycleDay - 16) / (cycleLength - 16)) * 100;
  }

  // Days until next period
  let daysUntilNext = Math.ceil((nextPeriodStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilNext < 0) {
    // If we passed the predicted date without input, cycle wraps
    daysUntilNext = (daysUntilNext % cycleLength + cycleLength) % cycleLength;
  }

  return {
    phase,
    phaseProgress: Math.min(100, Math.max(0, Math.round(phaseProgress))),
    daysUntilNext,
    nextPeriodStartDate,
    fertileWindowStart,
    fertileWindowEnd,
    ovulationDate
  };
}

// Generate default logs so the app has high-quality dummy data
export function getInitialLogs(): DailyLog[] {
  const logs: DailyLog[] = [];
  const today = new Date();

  // Create logs for a previous period 28 days ago (lasted 5 days)
  const prevPeriodStart = new Date(today);
  prevPeriodStart.setDate(today.getDate() - 28 - 12); // ~40 days ago
  for (let i = 0; i < 5; i++) {
    const d = new Date(prevPeriodStart);
    d.setDate(prevPeriodStart.getDate() + i);
    logs.push({
      dateStr: formatDateStr(d),
      flow: i === 0 || i === 4 ? 'spotty' : i === 2 ? 'heavy' : 'normal',
      symptoms: i === 1 ? ['cramps', 'sleepy'] : i === 2 ? ['cramps', 'snacks'] : [],
      mood: i === 1 ? 'cloudy' : i === 2 ? 'angry' : 'marshmallow',
      waterIntake: i === 2 ? 4 : 6,
      notes: i === 2 ? 'Craving spicy food and very moody today.' : 'Uterus gym in full swing.'
    });
  }

  // Create logs for the current period which started 12 days ago (lasted 5 days)
  const curPeriodStart = new Date(today);
  curPeriodStart.setDate(today.getDate() - 12);
  for (let i = 0; i < 5; i++) {
    const d = new Date(curPeriodStart);
    d.setDate(curPeriodStart.getDate() + i);
    logs.push({
      dateStr: formatDateStr(d),
      flow: i === 0 || i === 4 ? 'spotty' : 'normal',
      symptoms: i === 1 ? ['cramps'] : i === 3 ? ['snacks'] : [],
      mood: i === 1 ? 'cloudy' : i === 3 ? 'sparkly' : 'marshmallow',
      waterIntake: 7,
      notes: i === 1 ? 'Pet-betha level 2!' : 'Feeling better!'
    });
  }

  // Add a couple of other symptom logs
  const p1 = new Date(today);
  p1.setDate(today.getDate() - 4);
  logs.push({
    dateStr: formatDateStr(p1),
    flow: 'none',
    symptoms: ['puppy'],
    mood: 'sparkly',
    waterIntake: 9,
    notes: 'Incredible mood and energy! Feeling fabulous.'
  });

  const p2 = new Date(today);
  p2.setDate(today.getDate() - 1);
  logs.push({
    dateStr: formatDateStr(p2),
    flow: 'none',
    symptoms: ['bloated', 'snacks'],
    mood: 'sensitive',
    waterIntake: 5,
    notes: 'Feeling bloated like a pufferfish!'
  });

  return logs;
}
