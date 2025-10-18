import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LogIn";
import Home from "./pages/psas/Home";
import Evaluations from "./pages/psas/Evaluations";
import Certificates from "./pages/psas/Certificates";
import EventAnalytics from "./pages/psas/EventAnalytics";
import Reports from "./pages/psas/Reports";
import ClubOfficerDashboard from "./pages/club-officers/Dashboard";
import ParticipantDashboard from "./pages/participants/Dashboard";
import SchoolAdminDashboard from "./pages/school-admins/Dashboard";
import MisDashboard from "./pages/mis/Dashboard";
import UserManagement from "./pages/mis/UserManagement";
import Profile from "./pages/Profile";
import AuthCallback from "./pages/AuthCallback";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { user, token } = useAuth();

  const getHomeRoute = () => {
    if (!token) return "/login";
    if (!user) return "/login";

    switch (user.role) {
      case "psas":
        return "/psas";
      case "club-officer":
        return "/club-officer";
      case "participant":
        return "/participant";
      case "school-admin":
        return "/school-admin";
      case "mis":
        return "/mis";
      default:
        return "/login";
    }
  };

  // Protect routes based on role
  const isAuthorized = (allowedRole) => {
    return user && user.role === allowedRole;
  };

  // Role-based route protection is now handled directly in the Routes

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={!token ? <LoginPage /> : <Navigate to={getHomeRoute()} />}
        />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to={getHomeRoute()} />} />

        {/* PSAS routes */}
        <Route
          path="/psas"
          element={
            isAuthorized("psas") ? <Home /> : <Navigate to={getHomeRoute()} />
          }
        />
        <Route
          path="/psas/evaluations"
          element={
            isAuthorized("psas") ? (
              <Evaluations />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/psas/certificates"
          element={
            isAuthorized("psas") ? (
              <Certificates />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/psas/analytics"
          element={
            isAuthorized("psas") ? (
              <EventAnalytics />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/psas/reports"
          element={
            isAuthorized("psas") ? (
              <Reports />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />

        {/* Club Officer routes */}
        <Route
          path="/club-officer"
          element={
            isAuthorized("club-officer") ? (
              <ClubOfficerDashboard />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />

        {/* Participant routes */}
        <Route
          path="/participant"
          element={
            isAuthorized("participant") ? (
              <ParticipantDashboard />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />

        {/* School Admin routes */}
        <Route
          path="/school-admin"
          element={
            isAuthorized("school-admin") ? (
              <SchoolAdminDashboard />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />

        {/* MIS routes */}
        <Route
          path="/mis"
          element={
            isAuthorized("mis") ? (
              <MisDashboard />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/mis/user-management"
          element={
            isAuthorized("mis") ? (
              <UserManagement />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />

        {/* Profile route - accessible to all authenticated users */}
        <Route
          path="/profile"
          element={token ? <Profile /> : <Navigate to="/login" />}
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to={getHomeRoute()} />} />
      </Routes>
    </Router>
  );
}

export default App;
