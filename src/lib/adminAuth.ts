const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@sentinel.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
const ADMIN_SESSION_KEY = import.meta.env.VITE_ADMIN_SESSION_KEY || 'sentinel_admin_session';
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || 'sentinel_admin_secret_key_2024';

export interface AdminSession {
  email: string;
  loggedInAt: number;
}

export const adminAuth = {
  login: (email: string, password: string): boolean => {
    console.log(email, password, ADMIN_EMAIL, ADMIN_PASSWORD);
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const session: AdminSession = {
        email,
        loggedInAt: Date.now()
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  },

  isAuthenticated: (): boolean => {
    const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionData) return false;

    try {
      const session: AdminSession = JSON.parse(sessionData);
      const dayInMs = 24 * 60 * 60 * 1000;
      const isExpired = Date.now() - session.loggedInAt > dayInMs;
      
      if (isExpired) {
        adminAuth.logout();
        return false;
      }
      
      return session.email === ADMIN_EMAIL;
    } catch {
      return false;
    }
  },

  getSession: (): AdminSession | null => {
    const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionData) return null;

    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  },

  getApiHeaders: (): HeadersInit => {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': ADMIN_API_KEY
    };
  }
};
