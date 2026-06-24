import { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { COST_PER_TIFFIN, formatDate, countTiffins, maxPossibleTiffins, getDaysInMonth, getDefaultMealsForDate, type MonthData, type Settings } from './storage';
import { fetchSettings, updateSettings, fetchMeals, saveMeal, syncLocalStorageToMongoDB } from './api';
import Dashboard from './Dashboard';
import Tracker from './Tracker';
import Analytics from './Analytics';
import Login from './Login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Page = 'dashboard' | 'tracker' | 'analytics';

/* ===== SVG Icons ===== */
const IconDash = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
const IconCal = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconChart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
export const IconSun = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
export const IconMoon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconSearch = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    localStorage.getItem('tiffin:auth') === 'true' || sessionStorage.getItem('tiffin:auth') === 'true'
  );
  const [showProfileZoom, setShowProfileZoom] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');

  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [monthData, setMonthData] = useState<MonthData>({});

  const logout = useCallback(() => {
    localStorage.removeItem('tiffin:auth');
    localStorage.removeItem('tiffin:auth_token');
    sessionStorage.removeItem('tiffin:auth');
    sessionStorage.removeItem('tiffin:auth_token');
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!loading && settings) {
      if (!isAuthenticated && location.pathname !== '/login') {
        navigate('/login', { replace: true });
      } else if (isAuthenticated && location.pathname === '/login') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [loading, settings, isAuthenticated, location.pathname, navigate]);

  // Load settings and sync on auth status change
  useEffect(() => {
    async function init() {
      if (!isAuthenticated) {
        setSettings({ theme: 'dark' });
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const [s, meals] = await Promise.all([
          fetchSettings(),
          fetchMeals(viewYear, viewMonth)
        ]);
        setSettings(s);
        document.documentElement.setAttribute('data-theme', s.theme);
        setMonthData(meals);
        
        // Sync legacy localStorage data to MongoDB in background
        syncLocalStorageToMongoDB().catch(err => 
          console.error('Background sync failed:', err)
        );
      } catch (err) {
        console.error('Failed to load initial data:', err);
        if (err instanceof Error && err.message === 'Unauthorized') {
          logout();
        }
      } finally {
        setLoading(false);
      }
    }
    
    init();
  }, [isAuthenticated]);

  // Load meals on year/month change
  useEffect(() => {
    if (!isAuthenticated || loading) return;
    
    async function loadMealsForMonth() {
      try {
        const meals = await fetchMeals(viewYear, viewMonth);
        setMonthData(meals);
      } catch (err) {
        console.error('Failed to fetch meals:', err);
      }
    }
    
    loadMealsForMonth();
  }, [viewYear, viewMonth, isAuthenticated]);

  const toggleTheme = useCallback(async () => {
    if (!settings) return;
    const next = settings.theme === 'light' ? 'dark' : 'light';
    const s = { ...settings, theme: next as 'light' | 'dark' };
    setSettings(s);
    document.documentElement.setAttribute('data-theme', next);
    try {
      await updateSettings(s);
    } catch (err) {
      console.error('Failed to save theme setting:', err);
    }
  }, [settings]);

  const toggleMeal = useCallback(async (dateStr: string, meal: 'lunch' | 'dinner') => {
    const day = monthData[dateStr] || getDefaultMealsForDate(dateStr);
    const nextLunch = meal === 'lunch' ? !day.lunch : day.lunch;
    const nextDinner = meal === 'dinner' ? !day.dinner : day.dinner;
    
    setMonthData(prev => ({
      ...prev,
      [dateStr]: { lunch: nextLunch, dinner: nextDinner }
    }));
    
    try {
      await saveMeal(dateStr, nextLunch, nextDinner);
    } catch (err) {
      console.error('Failed to save meal log:', err);
      // Rollback on failure
      setMonthData(prev => ({
        ...prev,
        [dateStr]: day
      }));
    }
  }, [monthData]);

  const stats = useMemo(() => countTiffins(monthData), [monthData]);
  const totalCost = stats.total * COST_PER_TIFFIN;
  const maxTiffins = useMemo(() => maxPossibleTiffins(viewYear, viewMonth), [viewYear, viewMonth]);
  const projectedCost = useMemo(() => {
    const today = now.getDate();
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    if (viewYear !== now.getFullYear() || viewMonth !== now.getMonth() || today === 0) return totalCost;
    return Math.round((stats.total / today) * daysInMonth) * COST_PER_TIFFIN;
  }, [stats, totalCost, viewYear, viewMonth]);
  const savings = Object.keys(monthData).length === 0 ? 0 : (maxTiffins * COST_PER_TIFFIN) - totalCost;
  const todayStr = formatDate(now.getFullYear(), now.getMonth(), now.getDate());
  const todayData = monthData[todayStr] || getDefaultMealsForDate(todayStr);
  const todayIsSunday = now.getDay() === 0;

  const navMonth = (dir: -1 | 1) => {
    let m = viewMonth + dir, y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m); setViewYear(y);
  };

  const goToToday = useCallback(() => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  }, [now]);

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl animate-bounce">🍱</div>
          <div className="skeleton" style={{ width: 160, height: 20 }} />
        </div>
      </div>
    );
  }

  if (location.pathname === '/login') {
    return (
      <Login
        onSuccess={() => {
          setIsAuthenticated(true);
          navigate('/dashboard', { replace: true });
        }}
      />
    );
  }

  const navItems: { id: Page; label: string; icon: any; path: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <IconDash />, path: '/dashboard' },
    { id: 'tracker', label: 'Calendar', icon: <IconCal />, path: '/calendar' },
    { id: 'analytics', label: 'Analytics', icon: <IconChart />, path: '/analytics' },
  ];

  const sharedProps = {
    now, viewYear, viewMonth, monthData, stats, totalCost, projectedCost,
    savings, maxTiffins, todayStr, todayData, todayIsSunday,
    toggleMeal, navMonth, settings, toggleTheme, searchVal, goToToday, logout,
    onProfileZoom: () => setShowProfileZoom(true)
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-page)', fontFamily: 'var(--font-body)' }}>
      {/* ===== Desktop Sidebar ===== */}
      <aside className="sidebar">
        <div className="flex items-center gap-3 px-4 mb-8 logo-container">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'rgba(0, 135, 90, 0.1)', color: 'var(--primary)' }}>🍱</div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-200" style={{ fontFamily: 'var(--font-display)' }}>Tiffin Tracker</h1>
            <p className="text-[11px] text-slate-450 dark:text-slate-500">Daily meal log</p>
          </div>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest px-4 mb-3 section-title-wrapper" style={{ color: 'var(--text-muted)' }}>Menu</p>
        <div className="flex flex-col gap-[10px] menu-container">
          {navItems.map(item => (
            <Button key={item.id} variant="ghost" onClick={() => navigate(item.path)}
              className={`sidebar-link justify-start gap-2 h-auto px-4 py-3 rounded-xl w-full border-none shadow-none cursor-pointer ${location.pathname === item.path ? 'active' : ''}`}>
              {item.icon} {item.label}
            </Button>
          ))}
        </div>

        <div className="mt-[20px] general-container">
          <p className="text-[10px] font-bold uppercase tracking-widest px-4 mb-3 section-title-wrapper" style={{ color: 'var(--text-muted)' }}>General</p>
          <div className="flex flex-col gap-[10px]">
            <Button onClick={toggleTheme} variant="ghost" className="sidebar-link justify-start gap-2 h-auto px-4 py-3 rounded-xl w-full border-none shadow-none cursor-pointer text-slate-600 dark:text-slate-400">
              {settings.theme === 'light' ? <IconMoon /> : <IconSun />}
              {settings.theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Button>
            <Button onClick={logout} variant="ghost" className="sidebar-link justify-start gap-2 h-auto px-4 py-3 rounded-xl w-full border-none shadow-none cursor-pointer text-red-500 hover:text-red-650 hover:bg-red-500/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </Button>
          </div>
        </div>

        <div className="mt-auto mx-2 p-[20px] mt-[16px] rounded-2xl tip-card" style={{ background: 'var(--stat-green-bg)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--stat-green)' }}>💡 Tip of the Day</p>
          <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.55' }}>
            Track meals daily to get accurate monthly cost projections!
          </p>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <main className="main-content">
        {/* Top Header Bar (Dribbble Style) */}
        <header className="hidden lg:flex items-center gap-[16px] mb-[24px]" style={{ borderBottom: '1px solid var(--border)', padding: '16px 28px', width: '100%' }}>
          <div className="relative search-wrapper flex-1 mx-auto" style={{ maxWidth: '480px' }}>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <IconSearch />
            </span>
            <Input
              type="text"
              placeholder="Search meals, dates, analytics..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-2xl text-sm transition-all focus-visible:ring-2 focus-visible:ring-emerald-500/20 search-input"
              style={{ paddingLeft: '48px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', height: '40px' }}
            />
          </div>

          <div className="flex items-center gap-6 header-actions flex-shrink-0">
            <Button onClick={logout} variant="outline" size="icon" className="p-2.5 rounded-xl h-10 w-10 relative flex-shrink-0 cursor-pointer text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-red-500 hover:bg-red-500/10" style={{ background: 'var(--bg-card)' }} title="Logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </Button>

            <Button variant="outline" size="icon" className="p-2.5 rounded-xl h-10 w-10 relative flex-shrink-0 cursor-pointer text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800" style={{ background: 'var(--bg-card)' }}>
              <IconBell />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </Button>

            <div className="flex items-center gap-3 profile-container flex-shrink-0" style={{ whiteSpace: 'nowrap' }}>
              <div
                onClick={() => setShowProfileZoom(true)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/20 flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
                style={{ background: '#E2E8F0' }}
                title="Click to zoom"
              >
                <img src="/app-icon.jpeg" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="text-left profile-text flex-shrink-0" style={{ whiteSpace: 'nowrap' }}>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200" style={{ lineHeight: '1.55', whiteSpace: 'nowrap' }}>Falguni James</p>
              </div>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard {...sharedProps} />} />
          <Route path="/calendar" element={<Tracker {...sharedProps} />} />
          <Route path="/analytics" element={<Analytics {...sharedProps} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* ===== Zoomed Profile Image Modal ===== */}
      {showProfileZoom && (
        <div
          onClick={() => setShowProfileZoom(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex flex-col items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-full max-h-[85vh] bg-slate-900 border border-slate-800 rounded-[32px] p-2 overflow-hidden shadow-2xl shadow-black/80 animate-fadeIn"
          >
            {/* Playful Floating text overlay */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-950/85 backdrop-blur-md text-white border border-emerald-500/20 text-xs md:text-sm font-semibold py-2.5 px-5 rounded-full shadow-xl whitespace-nowrap z-10 flex items-center gap-1.5 animate-bounce select-none">
              <span>✨ itna ghoor k kyu dekhre ho, cute huna? 😉</span>
            </div>

            <img
              src="/app-icon.jpeg"
              alt="Zoomed Avatar"
              className="max-w-[min(500px,90vw)] max-h-[70vh] rounded-[24px] object-cover"
            />
            <div className="flex items-center justify-between px-4 py-3 text-slate-200">
              <span className="text-sm font-semibold">Falguni James</span>
              <button
                onClick={() => setShowProfileZoom(false)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer text-slate-300 hover:text-white border-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Mobile Bottom Nav ===== */}
      <nav className="bottom-nav">
        <div className="flex justify-around items-center" style={{ padding: '0 8px' }}>
          {navItems.map(item => (
            <Button key={item.id} variant="ghost" onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center rounded-xl transition-all duration-200 border-none shadow-none cursor-pointer h-auto"
              style={{
                color: location.pathname === item.path ? 'var(--toggle-active)' : 'var(--text-muted)',
                background: location.pathname === item.path ? 'var(--active-highlight)' : 'transparent',
                fontWeight: location.pathname === item.path ? 600 : 400,
                padding: '10px 24px', gap: '4px', minWidth: '80px',
              }}>
              {item.icon}
              <span style={{ fontSize: '10px' }}>{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
}
