// Storage utilities for Tiffin Tracker
export interface DayData { lunch: boolean; dinner: boolean; }
export interface MonthData { [date: string]: DayData; }
export interface Settings { theme: 'light' | 'dark'; }

const SETTINGS_KEY = 'tiffin:settings';
const getMonthKey = (y: number, m: number) => `tiffin:${y}-${String(m + 1).padStart(2, '0')}`;

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { theme: 'light' };
}

export function saveSettings(s: Settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
}

export function loadMonth(year: number, month: number): MonthData {
  try {
    const raw = localStorage.getItem(getMonthKey(year, month));
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function saveMonth(year: number, month: number, data: MonthData) {
  try { localStorage.setItem(getMonthKey(year, month), JSON.stringify(data)); } catch {}
}

export const COST_PER_TIFFIN = 35;

export function isSunday(y: number, m: number, d: number): boolean {
  return new Date(Date.UTC(y, m, d)).getUTCDay() === 0;
}

export function getDaysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
}

export function getFirstDayOfWeek(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 1)).getUTCDay();
}

export function formatDate(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function countTiffins(data: MonthData): { lunch: number; dinner: number; total: number } {
  let lunch = 0, dinner = 0;
  Object.values(data).forEach(d => { if (d.lunch) lunch++; if (d.dinner) dinner++; });
  return { lunch, dinner, total: lunch + dinner };
}

export function maxPossibleTiffins(y: number, m: number): number {
  const days = getDaysInMonth(y, m);
  let total = 0;
  for (let d = 1; d <= days; d++) {
    total += 1; // lunch always
    if (!isSunday(y, m, d)) total += 1; // dinner except sunday
  }
  return total;
}

export const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const DAY_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export function isFutureDate(dateStr: string): boolean {
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return dateStr > todayStr;
}

export function getDefaultMealsForDate(dateStr: string): DayData {
  if (isFutureDate(dateStr)) {
    return { lunch: false, dinner: false };
  }
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  const dayOfWeek = dateObj.getUTCDay();
  const isSun = dayOfWeek === 0;
  return {
    lunch: true,
    dinner: !isSun
  };
}

