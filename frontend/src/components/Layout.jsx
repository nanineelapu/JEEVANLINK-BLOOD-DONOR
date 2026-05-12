import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} JEEVANLINK · Saving lives, one donor at a time.
      </footer>
    </div>
  );
}
