import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, LogOut, MessageCircle, Package, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { notificationApi } from '../api/notification.api.js';
import Logo from './Logo.jsx';

export default function Navbar() {
  const { user, logout, isDonor, isHospital } = useAuth();
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    const fetchUnread = () =>
      notificationApi.unreadCount().then((d) => alive && setUnread(d.unread || 0)).catch(() => {});
    fetchUnread();
    const t = setInterval(fetchUnread, 30000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const linkBase = 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300';
  const linkActive = 'bg-brand-600/10 text-brand-600 shadow-glass';
  const linkIdle = 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50';

  return (
    <header className="sticky top-4 z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="glass rounded-2xl px-6 py-2">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Logo textClass="text-xl font-black tracking-tight bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent" />
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </NavLink>
            {isHospital && (
              <NavLink to="/inventory" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
                <Package className="h-4 w-4" /> Inventory
              </NavLink>
            )}
            {isDonor && (
              <NavLink to="/eligibility" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
                <MessageCircle className="h-4 w-4" /> Eligibility
              </NavLink>
            )}
            <NavLink to="/notifications" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
              <span className="relative">
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white animate-pulse" />
                )}
              </span>
              Alerts
            </NavLink>
          </nav>

          <div className="flex items-center gap-4 pl-4 border-l border-slate-200/50">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900 leading-tight">{user?.fullName || 'User'}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {user?.role === 'HOSPITAL_ADMIN' ? 'HOSPITAL' : 'DONOR'}
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-soft ring-4 ring-slate-100">
              {(user?.fullName || user?.email || '?').slice(0, 1).toUpperCase()}
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
