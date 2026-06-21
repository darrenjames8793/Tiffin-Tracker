import { useState, useEffect, useMemo } from 'react';
import { MONTH_NAMES, DAY_NAMES, getDaysInMonth, getFirstDayOfWeek, isSunday, formatDate, type MonthData, type Settings } from './storage';
import { IconSun, IconMoon } from './App';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  viewYear: number; viewMonth: number; monthData: MonthData;
  now: Date; toggleMeal: (date: string, meal: 'lunch' | 'dinner') => void;
  navMonth: (dir: -1 | 1) => void;
  settings: Settings; toggleTheme: () => void;
  goToToday: () => void;
  [key: string]: unknown;
}

export default function Tracker({ viewYear, viewMonth, monthData, now, toggleMeal, navMonth, settings, toggleTheme, goToToday, logout, onProfileZoom }: Props & { logout: () => void, onProfileZoom?: () => void }) {
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const todayDate = now.getDate();
  const todayStr = formatDate(now.getFullYear(), now.getMonth(), now.getDate());

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return formatDate(now.getFullYear(), now.getMonth(), now.getDate());
  });

  useEffect(() => {
    const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
    const defaultDay = isCurrentMonth ? now.getDate() : 1;
    setSelectedDate(formatDate(viewYear, viewMonth, defaultDay));
  }, [viewYear, viewMonth]);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, firstDay]);

  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return null;
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return null;
    return {
      year: parseInt(parts[0]),
      month: parseInt(parts[1]) - 1,
      day: parseInt(parts[2])
    };
  }, [selectedDate]);

  return (
    <div className="anim-up page-container">
      {/* Header (Mobile view) */}
      <div className="flex lg:hidden items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display">Calendar</h1>
          <p className="text-xs text-slate-400 mt-0.5">Track your daily meals</p>
        </div>
        <div className="flex items-center gap-2">
          {onProfileZoom && (
            <div
              onClick={onProfileZoom}
              className="w-10 h-10 rounded-full overflow-hidden border border-emerald-500/20 flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
              style={{ background: '#E2E8F0' }}
              title="Click to zoom"
            >
              <img src="/app-icon.jpeg" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          )}
          <Button onClick={toggleTheme} variant="outline" className="p-2 h-10 w-10 rounded-xl">
            {settings.theme === 'light' ? <IconMoon /> : <IconSun />}
          </Button>
          <Button onClick={logout} variant="outline" className="p-2 h-10 w-10 rounded-xl text-red-500 hover:bg-red-500/10" title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </Button>
        </div>
      </div>

      {/* Month Navigation Row */}
      <Card className="p-4 sm:p-8 mb-[28px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-label text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.1em]">Viewing Period</span>
          <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-200 mt-1">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex gap-2">
            <Button onClick={() => navMonth(-1)} variant="outline" className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </Button>
            <Button onClick={() => navMonth(1)} variant="outline" className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Button>
          </div>
          <Button onClick={goToToday} className="px-5 h-12 bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 hover:shadow-lg rounded-xl font-semibold transition-all flex items-center gap-2 border-none cursor-pointer text-sm whitespace-nowrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Go to Today
          </Button>
        </div>
      </Card>

      {/* Calendar Card */}
      <Card className="p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 gap-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Monthly Meal Log</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Tap cells to select, or click L/D to log meals</p>
          </div>
          {/* Legend */}
          <div className="flex gap-4 flex-wrap">
            {[
              { color: '#E8872A', label: 'Lunch Logged' },
              { color: 'var(--toggle-active)', label: 'Dinner Logged' },
              { color: 'var(--bg-input)', label: 'Skipped', border: true },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: l.color, border: l.border ? '1px solid var(--border)' : undefined }} />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-4 mb-4">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-xs font-bold py-2 text-slate-400 dark:text-slate-500 uppercase tracking-wider"
              style={{ color: d === 'Sun' ? '#E8872A' : undefined }}>{d}</div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-4">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`e${i}`} className="opacity-0" />;
            const dateStr = formatDate(viewYear, viewMonth, day);
            const data = monthData[dateStr] || { lunch: false, dinner: false };
            const sun = isSunday(viewYear, viewMonth, day);
            const isToday = isCurrentMonth && day === todayDate;
            const isFuture = isCurrentMonth && day > todayDate;
            const isSelected = selectedDate === dateStr;

            return (
              <div key={day} 
                onClick={() => setSelectedDate(dateStr)}
                className={`rounded-2xl calendar-cell transition-all duration-200 cursor-pointer ${isFuture ? 'opacity-35' : ''}`}
                style={{
                  background: 'var(--bg-input)',
                  border: isSelected 
                    ? '2px solid var(--toggle-active)' 
                    : isToday 
                      ? '2px solid #E8872A' 
                      : '2px solid transparent',
                  boxShadow: isSelected 
                    ? '0 4px 12px rgba(0,135,90,0.15)'
                    : isToday 
                      ? '0 4px 12px rgba(232,135,42,0.15)' 
                      : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '8px',
                  aspectRatio: '1',
                  minWidth: 0
                }}>
                <div className="flex justify-between items-center w-full px-1">
                  <span className="font-bold text-slate-500 dark:text-slate-400" style={{ fontSize: '12px', color: isToday ? '#E8872A' : sun ? '#E8872A90' : undefined }}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="hidden sm:inline-block px-1.5 py-[2px] bg-orange-500 text-white rounded text-[8px] font-bold uppercase tracking-wide">Today</span>
                  )}
                </div>

                {/* Desktop Buttons */}
                <div className="hidden sm:flex flex-col gap-1 w-full" style={{ gap: '4px' }}>
                  <Button onClick={(e) => { e.stopPropagation(); toggleMeal(dateStr, 'lunch'); }}
                    variant="outline"
                    className="w-full font-bold rounded-lg transition-all duration-200 py-1 h-7 text-center flex items-center justify-center cursor-pointer text-xs"
                    style={{
                      background: data.lunch ? 'rgba(232, 135, 42, 0.15)' : 'var(--bg-card)',
                      color: data.lunch ? '#E8872A' : 'var(--text-secondary)',
                      border: data.lunch ? '1px solid rgba(232, 135, 42, 0.3)' : '1px solid var(--border)',
                    }}>
                    L
                  </Button>

                  <Button onClick={(e) => { e.stopPropagation(); !sun && toggleMeal(dateStr, 'dinner'); }}
                    variant="outline"
                    className="w-full font-bold rounded-lg transition-all duration-200 py-1 h-7 text-center flex items-center justify-center text-xs"
                    disabled={sun}
                    style={{
                      background: sun ? 'transparent' : data.dinner ? 'rgba(0, 135, 90, 0.15)' : 'var(--bg-card)',
                      color: sun ? 'var(--text-muted)' : data.dinner ? 'var(--toggle-active)' : 'var(--text-secondary)',
                      border: sun ? '1px dashed var(--border)' : data.dinner ? '1px solid rgba(0, 135, 90, 0.3)' : '1px solid var(--border)',
                      opacity: sun ? 0.35 : 1,
                      cursor: sun ? 'not-allowed' : 'pointer',
                    }}>
                    D
                  </Button>
                </div>

                {/* Mobile Indicators */}
                <div className="flex sm:hidden items-center justify-center gap-1 mt-auto mb-0.5">
                  <div className={`w-2 h-2 rounded-full transition-all duration-200 ${data.lunch ? 'bg-orange-500 scale-110 shadow-sm' : 'border border-slate-300 dark:border-slate-700 bg-transparent'}`} />
                  <div className={`w-2 h-2 rounded-full transition-all duration-200 ${sun ? 'opacity-0' : data.dinner ? 'bg-emerald-500 scale-110 shadow-sm' : 'border border-slate-300 dark:border-slate-700 bg-transparent'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Mobile Selection Action Panel */}
      {selectedDate && (
        <Card className="block sm:hidden mt-6 p-6 anim-up">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div>
              <span className="font-label text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.1em]">Selected Date</span>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {selectedDateObj ? `${MONTH_NAMES[selectedDateObj.month]} ${selectedDateObj.day}, ${selectedDateObj.year}` : selectedDate}
              </h4>
            </div>
            {selectedDate === todayStr && (
              <span className="px-2.5 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider">
                Today
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* Lunch Log Card */}
            <div 
              onClick={() => toggleMeal(selectedDate, 'lunch')}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                (monthData[selectedDate]?.lunch)
                  ? 'bg-orange-500/10 border-orange-500/30' 
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`p-2.5 rounded-xl text-xl flex items-center justify-center ${
                  (monthData[selectedDate]?.lunch)
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  ☀️
                </span>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Lunch</p>
                  <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                    {(monthData[selectedDate]?.lunch) ? 'Logged • ₹35' : 'Skipped • ₹0'}
                  </p>
                </div>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ${
                (monthData[selectedDate]?.lunch) ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}>
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                  (monthData[selectedDate]?.lunch) ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </div>

            {/* Dinner Log Card */}
            <div 
              onClick={() => {
                const parts = selectedDate.split('-');
                const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                if (d.getDay() !== 0) {
                  toggleMeal(selectedDate, 'dinner');
                }
              }}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                selectedDate.split('-')[0] && new Date(parseInt(selectedDate.split('-')[0]), parseInt(selectedDate.split('-')[1]) - 1, parseInt(selectedDate.split('-')[2])).getDay() === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-dashed border-slate-200 dark:border-slate-800'
                  : 'cursor-pointer ' + ((monthData[selectedDate]?.dinner)
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/60')
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`p-2.5 rounded-xl text-xl flex items-center justify-center ${
                  selectedDate.split('-')[0] && new Date(parseInt(selectedDate.split('-')[0]), parseInt(selectedDate.split('-')[1]) - 1, parseInt(selectedDate.split('-')[2])).getDay() === 0
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    : (monthData[selectedDate]?.dinner)
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  🌙
                </span>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Dinner</p>
                  <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                    {selectedDate.split('-')[0] && new Date(parseInt(selectedDate.split('-')[0]), parseInt(selectedDate.split('-')[1]) - 1, parseInt(selectedDate.split('-')[2])).getDay() === 0
                      ? 'Sunday • No Dinner'
                      : (monthData[selectedDate]?.dinner) ? 'Logged • ₹35' : 'Skipped • ₹0'}
                  </p>
                </div>
              </div>
              {!(selectedDate.split('-')[0] && new Date(parseInt(selectedDate.split('-')[0]), parseInt(selectedDate.split('-')[1]) - 1, parseInt(selectedDate.split('-')[2])).getDay() === 0) && (
                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ${
                  (monthData[selectedDate]?.dinner) ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}>
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                    (monthData[selectedDate]?.dinner) ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
