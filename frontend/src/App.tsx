import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import ClientDashboard from './pages/ClientDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TrainersPage from './pages/TrainersPage';
import SchedulePage from './pages/SchedulePage';
import ProfilePage from './pages/ProfilePage';
import TrainerProfilePage from './pages/TrainerProfilePage';
import TrainerBookingsPage from './pages/TrainerBookingsPage';
import TrainerSessionsPage from './pages/TrainerSessionsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import TrainerRegistrationPage from './pages/TrainerRegistrationPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminSessionsPage from './pages/AdminSessionsPage';
import AdminSchedulesPage from './pages/AdminSchedulesPage';
import AdminMembershipsPage from './pages/AdminMembershipsPage';
import AdminProfilePage from './pages/AdminProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import AdminMembershipManagement from './pages/AdminMembershipManagement';
import ExpensesPage from './pages/ExpensesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import BookingModal from './components/BookingModal';
import { getCurrentUserFromToken } from './api';

export default function App() {
  const location = useLocation();
  // If the current location has a background state, keep it in background so modal can overlay
  const state = location.state as { background?: any };
  const background = state?.background;
  const currentUser = getCurrentUserFromToken();

  // Function to get the appropriate dashboard component based on user role
  const getDashboardComponent = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case 'client':
        return <ClientDashboard />;
      case 'trainer':
        return <TrainerDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Home />;
    }
  };

  return (
    <>
      <Routes location={background || location}>
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>{getDashboardComponent()}</Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute>
              <Layout>
                <ClientDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/trainer"
          element={
            <ProtectedRoute>
              <Layout>
                <TrainerDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/manager"
          element={
            <ProtectedRoute>
              <Layout>
                <ManagerDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminUsersPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trainers"
          element={
            <ProtectedRoute>
              <Layout>
                <TrainerRegistrationPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminBookingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sessions"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminSessionsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedules"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminSchedulesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/memberships"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminMembershipManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Layout>
                <ExpensesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/trainers"
          element={
            <Layout>
              <TrainersPage />
            </Layout>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Layout>
                <SchedulePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                {currentUser?.role === 'trainer' ? (
                  <TrainerProfilePage />
                ) : (
                  <ProfilePage />
                )}
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <Layout>
                <UserProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-sessions"
          element={
            <ProtectedRoute>
              <Layout>
                <TrainerSessionsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Layout>
                <TrainerBookingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions/:id/book"
          element={
            <Layout>
              <BookingModal />
            </Layout>
          }
        />
        <Route
          path="/time-slot/:id/book"
          element={
            <Layout>
              <BookingModal />
            </Layout>
          }
        />
      </Routes>

      {/* Show the modal when the route matches and we have a background location */}
      {background && (
        <Routes>
          <Route
            path="/sessions/:id/book"
            element={
              <Layout>
                <BookingModal />
              </Layout>
            }
          />
          <Route
            path="/time-slot/:id/book"
            element={
              <Layout>
                <BookingModal />
              </Layout>
            }
          />
        </Routes>
      )}
    </>
  );
}
