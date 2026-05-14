import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// ── Layout ────────────────────────────────────────────────────
import Navbar      from './components/common/Navbar';
import Footer      from './components/common/Footer';
import Loader      from './components/common/Loader';
import ScrollToTop from './components/common/ScrollToTop';

// ── Pages ─────────────────────────────────────────────────────
import HomePage         from './pages/HomePage';
import LoginPage        from './pages/auth/LoginPage';
import RegisterPage     from './pages/auth/RegisterPage';
import EventsPage       from './pages/events/EventsPage';
import EventDetailPage  from './pages/events/EventDetailPage';
import CreateEventPage  from './pages/events/CreateEventPage';
import EditEventPage    from './pages/events/EditEventPage';
import UserDashboard    from './pages/dashboard/UserDashboard';
import HostDashboard    from './pages/dashboard/HostDashboard';
import AdminDashboard   from './pages/dashboard/AdminDashboard';
import QRScannerPage    from './pages/dashboard/QRScannerPage';
import CareerFairPage   from './pages/careerfair/CareerFairPage';
import NotFoundPage     from './pages/NotFoundPage';

// ── Protected Route ───────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, isLoggedIn, loading } = useAuth();
  if (loading)     return <Loader />;
  if (!isLoggedIn) return <Navigate to="/login" />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" />;
  return children;
};

// ── App ───────────────────────────────────────────────────────
const App = () => {
  const { loading } = useAuth();
  if (loading) return <Loader message="Starting Eventify..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ScrollToTop />
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>

          {/* ── Public Routes ────────────────────────── */}
          <Route path="/"         element={<HomePage />}       />
          <Route path="/login"    element={<LoginPage />}      />
          <Route path="/register" element={<RegisterPage />}   />
          <Route path="/events"   element={<EventsPage />}     />
          <Route path="/events/:id" element={<EventDetailPage />} />

          {/* ── Career Fair — Public ─────────────────── */}
          <Route
            path="/careerfair/:eventId/jobs"
            element={<CareerFairPage />}
          />

          {/* ── Host Routes ──────────────────────────── */}
          <Route path="/events/create" element={
            <ProtectedRoute roles={['host']}>
              <CreateEventPage />
            </ProtectedRoute>
          } />
          <Route path="/events/:id/edit" element={
            <ProtectedRoute roles={['host']}>
              <EditEventPage />
            </ProtectedRoute>
          } />
          <Route path="/scanner" element={
            <ProtectedRoute roles={['host']}>
              <QRScannerPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/host" element={
            <ProtectedRoute roles={['host']}>
              <HostDashboard />
            </ProtectedRoute>
          } />

          {/* ── User Routes ──────────────────────────── */}
          <Route path="/dashboard/user" element={
            <ProtectedRoute roles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          } />

          {/* ── Admin Routes ─────────────────────────── */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* ── 404 ──────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;