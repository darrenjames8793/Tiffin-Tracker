import { useMemo } from 'react';
import { MONTH_NAMES, COST_PER_TIFFIN, formatDate, getDefaultMealsForDate, type MonthData, type DayData, type Settings } from './storage';
import { IconSun, IconMoon } from './App';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Props {
  now: Date; todayStr: string; todayData: DayData; todayIsSunday: boolean;
  toggleMeal: (date: string, meal: 'lunch' | 'dinner') => void;
  totalCost: number; stats: { lunch: number; dinner: number; total: number };
  projectedCost: number; monthData: MonthData;
  viewYear: number; viewMonth: number;
  settings: Settings; toggleTheme: () => void;
  [key: string]: unknown;
}

export default function Dashboard({ now, todayStr, todayData, todayIsSunday, toggleMeal, totalCost, stats, projectedCost, monthData, viewYear, settings, toggleTheme, logout, onProfileZoom }: Props & { logout: () => void, onProfileZoom?: () => void }) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const streak = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = formatDate(d.getFullYear(), d.getMonth(), d.getDate());
      const data = monthData[key] || getDefaultMealsForDate(key);
      const sun = d.getDay() === 0;
      days.push({ date: d, key, data, sun, dayLabel: ['S','M','T','W','T','F','S'][d.getDay()], dayNum: d.getDate() });
    }
    return days;
  }, [now, monthData]);

  const recentHistory = useMemo(() => {
    const list = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = formatDate(d.getFullYear(), d.getMonth(), d.getDate());
      const data = monthData[key] || getDefaultMealsForDate(key);
      const isSun = d.getDay() === 0;
      let cost = 0;
      if (data.lunch) cost += COST_PER_TIFFIN;
      if (!isSun && data.dinner) cost += COST_PER_TIFFIN;
      list.push({
        date: key,
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        monthName: MONTH_NAMES[d.getMonth()].slice(0, 3),
        lunch: data.lunch,
        dinner: isSun ? 'N/A' : data.dinner,
        cost
      });
    }
    return list;
  }, [now, monthData]);

  const statCards = [
    { title: 'Total Spent', value: `₹${totalCost.toLocaleString()}`, change: 'Active this month', sub: `${stats.total} tiffins consumed`, bgClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { title: 'Projected Cost', value: `₹${projectedCost.toLocaleString()}`, change: 'Based on current rate', sub: 'Estimated monthly cost', bgClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
    { title: 'Lunches Taken', value: stats.lunch.toString(), change: '☀️ Lunches logged', sub: `₹${(stats.lunch * COST_PER_TIFFIN).toLocaleString()} spent`, bgClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { title: 'Dinners Taken', value: stats.dinner.toString(), change: '🌙 Dinners logged', sub: `₹${(stats.dinner * COST_PER_TIFFIN).toLocaleString()} spent`, bgClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className="anim-up page-container">
      {/* Page Header (Mobile/Tablet View Title) */}
      <div className="flex lg:hidden items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {dayNames[now.getDay()]}, {now.getDate()} {MONTH_NAMES[now.getMonth()]} {now.getFullYear()}
          </p>
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

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-[28px] mb-[28px] stats-grid">
        {statCards.map((s, i) => (
          <Card key={i} className="stat-card flex flex-col justify-between" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-label text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{s.title}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600">•••</Button>
            </div>
            <div className="mb-4">
              <h3 className="font-display text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100" style={{ lineHeight: '1.35', whiteSpace: 'nowrap' }}>{s.value}</h3>
            </div>
            <div className="flex flex-col gap-1 border-t pt-4 border-slate-100 dark:border-slate-800">
              <div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.bgClass}`}>{s.change}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-450 dark:text-slate-500">{s.sub}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-[28px] content-grid">
        {/* Today's Meals Card */}
        <Card className="p-8 lg:col-span-1 flex flex-col justify-between" style={{ minHeight: '340px' }}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Today&apos;s Meals</h2>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{dayNames[now.getDay()]}</span>
            </div>
            <div className="flex flex-col gap-[12px] meals-container">
              {/* Lunch Row */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-[16px]">
                  <div className="rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400" style={{ width: '44px', height: '44px' }}>☀️</div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold whitespace-nowrap text-slate-800 dark:text-slate-200" style={{ fontSize: '16px', fontWeight: 600 }}>Lunch</p>
                    <p className="text-slate-400 dark:text-slate-500 whitespace-nowrap" style={{ fontSize: '13px', marginTop: '2px', lineHeight: '1.55' }}>{todayData.lunch ? 'Taken — ₹35' : 'Not taken'}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-auto">
                  <Switch checked={todayData.lunch} onCheckedChange={() => toggleMeal(todayStr, 'lunch')} />
                </div>
              </div>

              {/* Dinner Row */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-[16px]">
                  <div className="rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400" style={{ width: '44px', height: '44px' }}>🌙</div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold whitespace-nowrap text-slate-800 dark:text-slate-200" style={{ fontSize: '16px', fontWeight: 600, opacity: todayIsSunday ? 0.4 : 1 }}>Dinner</p>
                    <p className="text-slate-400 dark:text-slate-500 whitespace-nowrap" style={{ fontSize: '13px', marginTop: '2px', lineHeight: '1.55' }}>
                      {todayIsSunday ? 'No Sunday dinner' : todayData.dinner ? 'Taken — ₹35' : 'Not taken'}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-auto">
                  <Switch checked={todayData.dinner} disabled={todayIsSunday} onCheckedChange={() => toggleMeal(todayStr, 'dinner')} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t pt-4 border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-400 gap-[6px]">
              <span>Today&apos;s Cost:</span>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                ₹{((todayData.lunch ? 1 : 0) + (!todayIsSunday && todayData.dinner ? 1 : 0)) * COST_PER_TIFFIN}
              </span>
            </div>
          </div>
        </Card>

        {/* 7-Day Streak & Progress */}
        <Card className="p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Last 7 Days Streak</h2>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full font-medium">Progressive</span>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-8 pt-[20px] streak-grid">
            {streak.map((day, i) => {
              const lunchTaken = day.data.lunch;
              const dinnerTaken = !day.sun && day.data.dinner;
              const both = lunchTaken && (dinnerTaken || day.sun);
              const any = lunchTaken || dinnerTaken;
              const isToday = day.key === todayStr;
              return (
                <div key={i} className="flex flex-col items-center flex-1" style={{ gap: '8px' }}>
                  <span style={{ fontSize: '11px', opacity: 0.5, color: 'var(--text-muted)' }}>{day.dayLabel}</span>
                  <div className={`streak-circle flex items-center justify-center text-sm font-bold transition-all duration-300 ${isToday ? 'streak-today' : ''}`}
                    style={{
                      background: both ? 'var(--toggle-active)' : any ? '#E8872A' : 'var(--bg-input)',
                      color: any ? 'white' : 'var(--text-muted)',
                    }}>
                    {day.dayNum}
                  </div>
                  <div className="flex gap-1 justify-center" style={{ gap: '4px', marginTop: '4px' }}>
                    <div className="rounded-full transition-colors" style={{ width: '5px', height: '5px', background: lunchTaken ? '#E8872A' : 'var(--border)' }} />
                    {!day.sun && <div className="rounded-full transition-colors" style={{ width: '5px', height: '5px', background: dinnerTaken ? 'var(--toggle-active)' : 'var(--border)' }} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meal Split bar */}
          <div className="border-t flex flex-col gap-2 border-slate-100 dark:border-slate-800" style={{ padding: '16px 0', marginTop: '12px' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Monthly Meal Distribution</span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{stats.lunch} Lunches / {stats.dinner} Dinners</span>
            </div>
            <div className="flex rounded-full overflow-hidden" style={{ background: 'var(--bg-input)', height: '8px', borderRadius: '99px' }}>
              {stats.total > 0 && (
                <>
                  <div style={{ width: `${(stats.lunch / stats.total) * 100}%`, background: '#E8872A', transition: 'width 0.5s ease' }} />
                  <div style={{ width: `${(stats.dinner / stats.total) * 100}%`, background: 'var(--toggle-active)', transition: 'width 0.5s ease' }} />
                </>
              )}
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 gap-[6px]">
              <span style={{ lineHeight: '1.5' }}>Lunches: ₹{stats.lunch * COST_PER_TIFFIN}</span>
              <span style={{ lineHeight: '1.5' }}>Dinners: ₹{stats.dinner * COST_PER_TIFFIN}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Recent Meals History Table (Matching Dribbble Recent Orders) */}
      <Card className="p-8 mb-[28px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Recent meal history</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1" style={{ lineHeight: '1.5' }}>Detailed list of recent meal logs and daily spends</p>
          </div>
          <Button variant="outline" className="text-xs text-slate-400 hover:text-slate-650 transition-colors font-medium border rounded-xl px-3 py-1.5 border-slate-200 dark:border-slate-800 h-auto">View All</Button>
        </div>

        <div className="table-container">
          <Table className="tracker-table" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Lunch Status</TableHead>
                <TableHead>Dinner Status</TableHead>
                <TableHead>Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentHistory.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold text-slate-800 dark:text-slate-200">{row.dayNum} {row.monthName} {viewYear}</TableCell>
                  <TableCell>{row.dayName}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.lunch ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                      {row.lunch ? 'Taken' : 'Skipped'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {row.dinner === 'N/A' ? (
                      <span className="text-slate-300 dark:text-slate-600 text-xs font-semibold">Sunday N/A</span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.dinner ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                        {row.dinner ? 'Taken' : 'Skipped'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">₹{row.cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
