import type { Settings, MonthData } from './storage';

const getHeaders = () => {
  const token = localStorage.getItem('tiffin:auth_token') || sessionStorage.getItem('tiffin:auth_token') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export async function login(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('tiffin:auth_token', data.token);
      localStorage.setItem('tiffin:auth', 'true');
      return { success: true };
    } else {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || 'Incorrect password. Please try again.' };
    }
  } catch (error) {
    console.error('Login request failed:', error);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
}

export async function fetchSettings(): Promise<Settings> {
  const res = await fetch('/api/settings', {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function fetchMeals(year: number, month: number): Promise<MonthData> {
  const res = await fetch(`/api/meals/${year}/${month}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function saveMeal(date: string, lunch: boolean, dinner: boolean): Promise<any> {
  const res = await fetch(`/api/meals/${date}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ lunch, dinner })
  });
  if (!res.ok) throw new Error('Failed to save meal');
  return res.json();
}

export async function clearAllMeals(): Promise<void> {
  const res = await fetch('/api/clear-all', {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to clear meals');
}

export async function syncLocalStorageToMongoDB(): Promise<void> {
  try {
    // 1. Sync settings
    const localSettings = localStorage.getItem('tiffin:settings');
    if (localSettings) {
      await updateSettings(JSON.parse(localSettings));
    }

    // 2. Sync all logged months
    const keysToClean: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        key.startsWith('tiffin:') &&
        key !== 'tiffin:settings' &&
        key !== 'tiffin:auth' &&
        key !== 'tiffin:auth_token'
      ) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const monthData: MonthData = JSON.parse(raw);
          for (const [date, data] of Object.entries(monthData)) {
            await saveMeal(date, data.lunch, data.dinner);
          }
          keysToClean.push(key);
        }
      }
    }

    // 3. Clean up migrated localStorage keys
    localStorage.removeItem('tiffin:settings');
    keysToClean.forEach(key => localStorage.removeItem(key));
    console.log('Migrated legacy localStorage logs to MongoDB successfully.');
  } catch (err) {
    console.error('Failed to migrate offline logs to MongoDB:', err);
  }
}
