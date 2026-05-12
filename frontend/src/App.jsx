import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreateRequest from './pages/CreateRequest.jsx';
import RequestDetail from './pages/RequestDetail.jsx';
import Inventory from './pages/Inventory.jsx';
import EligibilityChat from './pages/EligibilityChat.jsx';
import Notifications from './pages/Notifications.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/requests/new" element={<CreateRequest />} />
          <Route path="/requests/:id" element={<RequestDetail />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/eligibility" element={<EligibilityChat />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
