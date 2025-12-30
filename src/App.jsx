import { Toaster } from "react-hot-toast";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LogIn";
import GuestLogin from "./pages/GuestLogin";
import GuestAccessPage from "./pages/GuestAccessPage";
import GuestEvaluatePage from "./pages/GuestEvaluatePage";
import GuestAccessHandler from "./pages/GuestAccessHandler";
import Home from "./pages/psas/Home";
import Evaluations from "./pages/psas/Evaluations";
import Certificates from "./pages/psas/Certificates";
import EventAnalytics from "./pages/psas/EventAnalytics";
import Reports from "./pages/psas/Reports";
import Notifications from "./pages/psas/Notifications";
import StudentList from "./pages/psas/StudentList";
import ClubOfficerHome from "./pages/club-officers/Home";
import ClubOfficerEvaluations from "./pages/club-officers/Evaluations";
import ClubOfficerCertificates from "./pages/club-officers/Certificates";
import ClubOfficerNotifications from "./pages/club-officers/Notifications";
import ClubOfficerEventAnalytics from "./pages/club-officers/EventAnalytics";
import ClubOfficerReports from "./pages/club-officers/Reports";
import SurveyCreation from "./pages/club-officers/SurveyCreation";
import ClubOfficerBadges from "./pages/club-officers/Badges";
import ParticipantHome from "./pages/participants/Home";
import ParticipantEvaluations from "./pages/participants/Evaluations";
import ParticipantCertificates from "./pages/participants/Certificates";
import ParticipantBadges from "./pages/participants/Badges";
import ParticipantNotifications from "./pages/participants/Notifications";
import EvaluationStart from "./pages/participants/EvaluationStart";
import EvaluationForm from "./pages/evaluation/EvaluationForm";
import SharedNotifications from "./pages/shared/Notifications";
import SchoolAdminHome from "./pages/school-admins/Home";
import SchoolAdminReports from "./pages/school-admins/Reports";
import MisDashboard from "./pages/mis/Dashboard";
import UserManagement from "./pages/mis/UserManagement";
import ClubOfficerLayout from "./components/club-officers/ClubOfficerLayout";
import PSASLayout from "./components/psas/PSASLayout";
import SchoolAdminLayout from "./components/school-admins/SchoolAdminLayout";
import MisLayout from "./components/mis/MisLayout";
import Profile from "./pages/Profile";
import Settings from "./pages/mis/Settings";
import MisReports from "./pages/mis/MisReports";
import AuthCallback from "./pages/AuthCallback";
import { useAuth } from "./contexts/useAuth";
import QuantitativeRatings from "./pages/reports/QuantitativeRatings";
import QualitativeComments from "./pages/reports/QualitativeComments";
import PositiveComments from "./pages/reports/PositiveComments";
import NegativeComments from "./pages/reports/NegativeComments";
import NeutralComments from "./pages/reports/NeutralComments";
import CompleteReport from "./pages/reports/CompleteReport";
import ReportSharingPage from "./pages/reports/ReportSharingPage";
import FormCreationInterface from "./components/psas/evaluations/FormCreationInterface";
import ClubOfficerEvaluationsContent from "./components/club-officers/ClubOfficerEvaluationsContent";
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationPopup from "./components/shared/NotificationPopup";
import { OnboardingProvider } from "./contexts/OnboardingContext.jsx";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";

// Sample form data removed - now fetched dynamically by EvaluationForm component
import OnboardingWrapper from "./components/onboarding/OnboardingWrapper";
import GuestSettings from "./pages/mis/GuestSettings";
import LandingPage from "./pages/LandingPage";

function App() {
  const { user, token, isLoading } = useAuth();

  const getHomeRoute = () => {
    if (!token) return "/login";
    if (!user) return "/login"; // Don't redirect during loading

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
      case "evaluator":
        return "/participant/home"; // Guest evaluators use participant interface
      case "guest-speaker":
        return "/participant/home"; // Guest speakers use participant interface
      default:
        return "/login";
    }
  };

  // Show loading screen during authentication
  if (isLoading && token && !user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Loading your account...
      </div>
    );
  }

  // Protect routes based on role
  const isAuthorized = (allowedRole) => {
    return user && user.role === allowedRole;
  };

  // Check if user is a guest (evaluator or guest-speaker)
  const isGuest = () => {
    return user && (user.role === "evaluator" || user.role === "guest-speaker");
  };

  // Check if user can access participant routes (participant or guest users)
  const canAccessParticipantRoutes = () => {
    return isAuthorized("participant") || isGuest();
  };

  // Role-based route protection is now handled directly in the Routes

  return (
    <NotificationProvider>
      <OnboardingProvider>
        <Router>
          <Toaster position="top-center" reverseOrder={false} />
          {token && user && <NotificationPopup />}
          <OnboardingWrapper />

          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={token ? <Navigate to={getHomeRoute()} /> : <LoginPage />}
            />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/guest-login"
              element={
                token ? <Navigate to={getHomeRoute()} /> : <GuestLogin />
              }
            />
            <Route
              path="/guest-access-handler"
              element={<GuestAccessHandler />}
            />
            {/* Root redirect */}
            <Route path="/" element={<LandingPage />} />
            {/* PSAS routes */}
            <Route
              path="/psas/home"
              element={
                isAuthorized("psas") ? (
                  <Home />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
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
                  <PSASLayout>
                    <FormCreationInterface
                      onBack={() =>
                        (window.location.href = "/psas/evaluations")
                      }
                    />
                  </PSASLayout>
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
              path="/psas/reports/prepared-by"
              element={
                isAuthorized("psas") ? (
                  <ReportSharingPage />
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
                isAuthorized("psas") || isAuthorized("club-officer") ? (
                  <StudentList />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/psas/profile"
              element={
                isAuthorized("psas") ? (
                  <Profile />
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
                  <ClubOfficerHome />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-officer/evaluations"
              element={
                isAuthorized("club-officer") ? (
                  <ClubOfficerEvaluations />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-officer/evaluations/create"
              element={
                isAuthorized("club-officer") ? (
                  <SurveyCreation />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-officer/evaluations/my"
              element={
                isAuthorized("club-officer") ? (
                  <ClubOfficerEvaluations />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-officer/certificates"
              element={
                isAuthorized("club-officer") ? (
                  <ClubOfficerCertificates />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-officer/certificates/make"
              element={
                isAuthorized("club-officer") ? (
                  <Certificates />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-officer/certificates/my"
              element={
                isAuthorized("club-officer") ? (
                  <ClubOfficerCertificates />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-officer/badges"
              element={
                isAuthorized("club-officer") ? (
                  <ClubOfficerBadges />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-officer/analytics"
              element={
                isAuthorized("club-officer") ? (
                  <ClubOfficerEventAnalytics />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-officer/form-creation"
              element={
                isAuthorized("club-officer") ? (
                  <ClubOfficerLayout>
                    <FormCreationInterface
                      onBack={() =>
                        (window.location.href =
                          "/club-officer/evaluations/create")
                      }
                    />
                  </ClubOfficerLayout>
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-officer/reports"
              element={
                isAuthorized("club-officer") ? (
                  <ClubOfficerReports />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-officer/reports/:eventId"
              element={
                isAuthorized("club-officer") ? (
                  <CompleteReport />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-officer/notifications"
              element={
                isAuthorized("club-officer") ? (
                  <ClubOfficerNotifications />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-officer"
              element={<Navigate to="/club-officer/home" />}
            />
            <Route
              path="/club-officer/profile"
              element={
                isAuthorized("club-officer") ? (
                  <Profile />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            {/* Guest Access Route - for guest speakers viewing reports */}
            <Route
              path="/guest-access"
              element={
                token ? <GuestAccessPage /> : <Navigate to="/guest-login" />
              }
            />
            {/* Public guest access route - uses token query param for authentication */}
            <Route path="/guest/access" element={<GuestAccessHandler />} />
            {/* Guest evaluator route - public access via token */}
            <Route path="/guest/evaluate" element={<GuestEvaluatePage />} />
            {/* Participant routes */}
            <Route
              path="/participant/home"
              element={
                canAccessParticipantRoutes() ? (
                  <ParticipantHome />
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
                canAccessParticipantRoutes() ? (
                  <ParticipantEvaluations />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/participant/certificates"
              element={
                canAccessParticipantRoutes() ? (
                  <ParticipantCertificates />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/participant/certificate/:certificateId"
              element={
                canAccessParticipantRoutes() ? (
                  <ParticipantCertificates />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/participant/badges"
              element={
                canAccessParticipantRoutes() ? (
                  <ParticipantBadges />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/participant/notifications"
              element={
                canAccessParticipantRoutes() ? (
                  <ParticipantNotifications />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/evaluations/start/:formId"
              element={
                canAccessParticipantRoutes() || isAuthorized("club-officer") ? (
                  <EvaluationStart />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/evaluations/form/:formId"
              element={
                canAccessParticipantRoutes() || isAuthorized("club-officer") ? (
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
                  <SchoolAdminHome />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/school-admin/reports"
              element={
                isAuthorized("school-admin") ? (
                  <SchoolAdminReports />
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
              path="/school-admin/profile"
              element={
                isAuthorized("school-admin") ? (
                  <SchoolAdminLayout>
                    <Profile />
                  </SchoolAdminLayout>
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

            <Route
              path="/mis/settings"
              element={
                isAuthorized("mis") ? (
                  <MisLayout>
                    <Settings />
                  </MisLayout>
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            >
              <Route path="guest" element={<GuestSettings />} />
              <Route index element={<Navigate to="guest" />} />
            </Route>
            <Route
              path="/mis/reports"
              element={
                isAuthorized("mis") ? (
                  <MisLayout>
                    <MisReports />
                  </MisLayout>
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/mis/profile"
              element={
                isAuthorized("mis") ? (
                  <MisLayout>
                    <Profile />
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
      </OnboardingProvider>
    </NotificationProvider>
  );
}

export default App;
