import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MONTH_NAMES, COST_PER_TIFFIN, getDaysInMonth, loadMonth, countTiffins, formatDate, DAY_FULL, type MonthData, type Settings } from './storage';
import { IconSun, IconMoon } from './App';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  viewYear: number; viewMonth: number; monthData: MonthData;
  stats: { lunch: number; dinner: number; total: number };
  totalCost: number; savings: number; maxTiffins: number;
  now: Date; settings: Settings; toggleTheme: () => void;
  navMonth: (dir: -1 | 1) => void;
  [key: string]: unknown;
}

export default function Analytics({ viewYear, viewMonth, monthData, stats, totalCost, savings, maxTiffins, now, settings, toggleTheme, navMonth, logout, onProfileZoom }: Props & { logout: () => void, onProfileZoom?: () => void }) {
  const weeklyData = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const weeks: { name: string; tiffins: number }[] = [];
    let weekNum = 1, count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDate(viewYear, viewMonth, d);
      const data = monthData[key];
      if (data) { if (data.lunch) count++; if (data.dinner) count++; }
      if (new Date(viewYear, viewMonth, d).getDay() === 6 || d === daysInMonth) {
        weeks.push({ name: `Wk ${weekNum}`, tiffins: count }); weekNum++; count = 0;
      }
    }
    return weeks;
  }, [viewYear, viewMonth, monthData]);

  const monthlyData = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      let m = viewMonth - i, y = viewYear;
      while (m < 0) { m += 12; y--; }
      const data = loadMonth(y, m);
      const { total } = countTiffins(data);
      result.push({ name: MONTH_NAMES[m].slice(0, 3), spend: total * COST_PER_TIFFIN });
    }
    return result;
  }, [viewYear, viewMonth]);

  const pieData = useMemo(() => [
    { name: 'Lunch', value: stats.lunch },
    { name: 'Dinner', value: stats.dinner },
  ], [stats]);
  const PIE_COLORS = ['#E8872A', 'var(--toggle-active)'];

  const mostSkipped = useMemo(() => {
    const skipCount = [0, 0, 0, 0, 0, 0, 0];
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
    const maxDay = isCurrentMonth ? now.getDate() : daysInMonth;
    for (let d = 1; d <= maxDay; d++) {
      const key = formatDate(viewYear, viewMonth, d);
      const data = monthData[key] || { lunch: false, dinner: false };
      const dow = new Date(viewYear, viewMonth, d).getDay();
      if (!data.lunch) skipCount[dow]++;
      if (dow !== 0 && !data.dinner) skipCount[dow]++;
    }
    const maxSkip = Math.max(...skipCount);
    return { day: DAY_FULL[skipCount.indexOf(maxSkip)], count: maxSkip };
  }, [viewYear, viewMonth, monthData, now]);

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const daysSoFar = isCurrentMonth ? now.getDate() : getDaysInMonth(viewYear, viewMonth);
  const dailyAvg = daysSoFar > 0 ? (totalCost / daysSoFar).toFixed(0) : '0';
  const attendPct = maxTiffins > 0 ? Math.round((stats.total / maxTiffins) * 100) : 0;

  const tipStyle = {
    contentStyle: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      fontSize: 12,
      fontFamily: 'var(--font-body)',
      boxShadow: 'var(--shadow)',
      color: 'var(--text)'
    }
  };

  return (
    <div className="anim-up page-container">
      {/* Header (Mobile View Title & Actions) */}
      <div className="flex lg:hidden flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div>
            <h1 className="text-2xl font-bold font-display">Analytics</h1>
            <p className="text-xs text-slate-400 mt-0.5">Insights & spending patterns</p>
          </div>
          {/* Actions for mobile view: show next to title when on sm viewport */}
          <div className="flex items-center gap-2 sm:hidden">
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
            <Button variant="outline" onClick={toggleTheme} className="p-2 h-10 w-10 rounded-xl">
              {settings.theme === 'light' ? <IconMoon /> : <IconSun />}
            </Button>
            <Button onClick={logout} variant="outline" className="p-2 h-10 w-10 rounded-xl text-red-500 hover:bg-red-500/10" title="Logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </Button>
          </div>
        </div>

        {/* Date Selector Row */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800 w-full sm:w-auto justify-between sm:justify-start">
            <Button variant="ghost" size="icon" onClick={() => navMonth(-1)} className="h-9 w-9 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </Button>
            <span className="text-xs font-semibold px-4 text-slate-700 dark:text-slate-350">{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <Button variant="ghost" size="icon" onClick={() => navMonth(1)} className="h-9 w-9 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Button>
          </div>
          
          {/* Actions for tablet view: hidden on mobile, shown on sm screens */}
          <div className="hidden sm:flex items-center gap-2">
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
            <Button variant="outline" onClick={toggleTheme} className="p-2 h-10 w-10 rounded-xl">
              {settings.theme === 'light' ? <IconMoon /> : <IconSun />}
            </Button>
            <Button onClick={logout} variant="outline" className="p-2 h-10 w-10 rounded-xl text-red-500 hover:bg-red-500/10" title="Logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-[28px] stats-grid-analytics">
        {[
          { title: 'Daily Average', value: `₹${dailyAvg}`, sub: 'Calculated from log', bg: 'var(--stat-orange-bg)', color: 'var(--stat-orange)', icon: '📊' },
          { title: 'Total Savings', value: `₹${savings}`, sub: 'vs full attendance', bg: 'var(--stat-green-bg)', color: 'var(--stat-green)', icon: '💚' },
          { title: 'Attendance', value: `${attendPct}%`, sub: `${stats.total} of ${maxTiffins} meals`, bg: 'var(--stat-blue-bg)', color: 'var(--stat-blue)', icon: '🎯' },
        ].map((s, i) => (
          <Card key={i} className="stat-card flex items-center justify-between" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex-1 min-w-0 text-left">
              <div className="mb-2">
                <span className="font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500" style={{ fontSize: '10px', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{s.title}</span>
              </div>
              <h3 className="font-bold tracking-tight" style={{ color: s.color, fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: '1.35', margin: '12px 0 16px', whiteSpace: 'nowrap' }}>{s.value}</h3>
              <div className="flex flex-col gap-1 border-t pt-[10px]" style={{ borderColor: 'var(--border-light)' }}>
                <span className="text-[11px] text-slate-450 dark:text-slate-500">{s.sub}</span>
              </div>
            </div>
            <span className="text-3xl p-3 rounded-2xl flex-shrink-0 ml-4" style={{ background: s.bg }}>{s.icon}</span>
          </Card>
        ))}
      </div>

      {/* Charts Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-[28px]">
        {/* Weekly Tiffins Chart */}
        <Card className="chart-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Weekly Tiffin Count</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Number of tiffins consumed per week</p>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 h-6 w-6">•••</Button>
          </div>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData} barCategoryGap="25%">
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip {...tipStyle} formatter={(v: any) => [`${v} meals`, 'Consumed']} />
                <Bar dataKey="tiffins" fill="var(--toggle-active)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-sm py-16 text-slate-400 dark:text-slate-500">No data available for this month</p>}
        </Card>

        {/* Spending Trend Chart */}
        <Card className="chart-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Monthly Spending Trend</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Last 6 months total spent comparison</p>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 h-6 w-6">•••</Button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} barCategoryGap="25%">
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip {...tipStyle} formatter={(v: any) => [`₹${v}`, 'Spend']} />
              <Bar dataKey="spend" fill="#E8872A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pie Chart / Donut */}
        <Card className="p-8 lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Meal Category</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Lunches vs Dinners distribution</p>
            </div>
          </div>
          {stats.total > 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 mt-4">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 w-full pt-4 border-t border-slate-100 dark:border-slate-800">
                {pieData.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{entry.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{entry.value} meals (₹{entry.value * COST_PER_TIFFIN})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-3xl mb-3" style={{ lineHeight: '1.35' }}>🍽️</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Log meals to view distribution</p>
            </div>
          )}
        </Card>

        {/* Insights list */}
        <Card className="p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Personal Insights</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Automatic savings & skipping habits overview</p>
            </div>
          </div>
          {stats.total === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl mb-4">💡</span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No insights available yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[280px] leading-relaxed">
                Log your first meal in the Calendar tab to start generating automated spending insights!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl flex items-start gap-4 bg-orange-500/10 dark:bg-orange-950/20 border border-orange-500/20">
                <span className="text-2xl mt-0.5">💡</span>
                <div>
                  <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">Most Skipped Day of Week</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    You missed the most meals on <strong>{mostSkipped.day}s</strong> ({mostSkipped.count} meals skipped). Try adjusting your subscription if this is a recurring habit!
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-2xl flex items-start gap-4 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20">
                <span className="text-2xl mt-0.5">💰</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Total Savings Accumulated</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    You saved exactly <strong>₹{savings}</strong> this month by skipping {maxTiffins - stats.total} tiffins compared to full month attendance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
