import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [ready, setReady] = useState(true);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const login = ({ token, userId, email, role, fullName }) => {
    localStorage.setItem('token', token);
    const u = { userId, email, role, fullName };
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isDonor = user?.role === 'DONOR';
  const isHospital = user?.role === 'HOSPITAL_ADMIN';

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, isDonor, isHospital }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
