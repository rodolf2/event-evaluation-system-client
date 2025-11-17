import { Toaster } from "react-hot-toast";
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
import Notifications from "./pages/psas/Notifications";
import StudentList from "./pages/psas/StudentList";
import ClubOfficerDashboard from "./pages/club-officers/Dashboard";
import ParticipantDashboard from "./pages/participants/Dashboard";
import ParticipantEvaluations from "./pages/participants/Evaluations";
import ParticipantCertificates from "./pages/participants/Certificates";
import ParticipantBadges from "./pages/participants/Badges";
import ParticipantNotifications from "./pages/participants/Notifications";
import EvaluationStart from "./pages/participants/EvaluationStart";
import EvaluationForm from "./pages/evaluation/EvaluationForm";
import SharedNotifications from "./pages/shared/Notifications";
import SchoolAdminDashboard from "./pages/school-admins/Dashboard";
import MisDashboard from "./pages/mis/Dashboard";
import UserManagement from "./pages/mis/UserManagement";
import ClubOfficerLayout from "./components/club-officers/ClubOfficerLayout";
import SchoolAdminLayout from "./components/school-admins/SchoolAdminLayout";
import MisLayout from "./components/mis/MisLayout";
import Profile from "./pages/Profile";
import AuthCallback from "./pages/AuthCallback";
import { useAuth } from "./contexts/useAuth";
import QuantitativeRatings from "./pages/reports/QuantitativeRatings";
import QualitativeComments from "./pages/reports/QualitativeComments";
import PositiveComments from "./pages/reports/PositiveComments";
import NegativeComments from "./pages/reports/NegativeComments";
import NeutralComments from "./pages/reports/NeutralComments";
import CompleteReport from "./pages/reports/CompleteReport";
import FormCreationInterface from "./components/psas/evaluations/FormCreationInterface";

// Sample form data removed - now fetched dynamically by EvaluationForm component

function App() {
  const { user, token } = useAuth();

  const getHomeRoute = () => {
    if (!token) return "/login";
    if (!user) return "/login";

    switch (user.role) {
      case "psas":
        return "/psas/home";
      case "club-officer":
        return "/club-officer/home";
      case "participant":
        return "/participant/home"; // Always redirect to full path
      case "school-admin":
        return "/school-admin/home";
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
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={token ? <Navigate to={getHomeRoute()} /> : <LoginPage />}
        />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to={getHomeRoute()} />} />

        {/* PSAS routes */}
        <Route
          path="/psas/home"
          element={
            isAuthorized("psas") ? <Home /> : <Navigate to={getHomeRoute()} />
          }
        />
        <Route path="/psas" element={<Navigate to="/psas/home" />} />
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
          path="/psas/create-form"
          element={
            isAuthorized("psas") ? (
              <FormCreationInterface onBack={() => window.history.back()} />
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
        <Route
          path="/psas/reports/:eventId"
          element={
            isAuthorized("psas") ? (
              <CompleteReport />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/psas/reports/quantitative-ratings/:eventId"
          element={
            isAuthorized("psas") ? (
              <QuantitativeRatings />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/psas/reports/qualitative-comments/:eventId"
          element={
            isAuthorized("psas") ? (
              <QualitativeComments />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/psas/reports/positive-comments/:eventId"
          element={
            isAuthorized("psas") ? (
              <PositiveComments />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/psas/reports/negative-comments/:eventId"
          element={
            isAuthorized("psas") ? (
              <NegativeComments />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/psas/reports/neutral-comments/:eventId"
          element={
            isAuthorized("psas") ? (
              <NeutralComments />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/psas/notifications"
          element={
            isAuthorized("psas") ? (
              <Notifications />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/psas/students"
          element={
            isAuthorized("psas") ? (
              <StudentList />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />

        {/* Club Officer routes */}
        <Route
          path="/club-officer/home"
          element={
            isAuthorized("club-officer") ? (
              <ClubOfficerLayout>
                <ClubOfficerDashboard />
              </ClubOfficerLayout>
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/club-officer/notifications"
          element={
            isAuthorized("club-officer") ? (
              <SharedNotifications layout={ClubOfficerLayout} />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/club-officer"
          element={<Navigate to="/club-officer/home" />}
        />

        {/* Participant routes */}
        <Route
          path="/participant/home"
          element={
            isAuthorized("participant") ? (
              <ParticipantDashboard />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/participant"
          element={<Navigate to="/participant/home" />}
        />
        <Route
          path="/participant/evaluations"
          element={
            isAuthorized("participant") ? (
              <ParticipantEvaluations />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/participant/certificates"
          element={
            isAuthorized("participant") ? (
              <ParticipantCertificates />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/participant/certificate/:certificateId"
          element={
            isAuthorized("participant") ? (
              <ParticipantCertificates />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/participant/badges"
          element={
            isAuthorized("participant") ? (
              <ParticipantBadges />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/participant/notifications"
          element={
            isAuthorized("participant") ? (
              <ParticipantNotifications />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/evaluations/start/:formId"
          element={
            isAuthorized("participant") ? (
              <EvaluationStart />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/evaluations/form/:formId"
          element={
            isAuthorized("participant") ? (
              <EvaluationForm />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />

        {/* School Admin routes */}
        <Route
          path="/school-admin/home"
          element={
            isAuthorized("school-admin") ? (
              <SchoolAdminLayout>
                <SchoolAdminDashboard />
              </SchoolAdminLayout>
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/school-admin/notifications"
          element={
            isAuthorized("school-admin") ? (
              <SharedNotifications layout={SchoolAdminLayout} />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/school-admin"
          element={<Navigate to="/school-admin/home" />}
        />

        {/* MIS routes */}
        <Route
          path="/mis"
          element={
            isAuthorized("mis") ? (
              <MisLayout>
                <MisDashboard />
              </MisLayout>
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/mis/notifications"
          element={
            isAuthorized("mis") ? (
              <SharedNotifications layout={MisLayout} />
            ) : (
              <Navigate to={getHomeRoute()} />
            )
          }
        />
        <Route
          path="/mis/user-management"
          element={
            isAuthorized("mis") ? (
              <MisLayout>
                <UserManagement />
              </MisLayout>
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
