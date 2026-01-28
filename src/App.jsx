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
import ClubAdviserHome from "./pages/club-advisers/Home";
import ClubAdviserReports from "./pages/club-advisers/Reports";
import ParticipantHome from "./pages/participants/Home.jsx";
import ParticipantEvaluations from "./pages/participants/Evaluations.jsx";
import ParticipantCertificates from "./pages/participants/Certificates.jsx";
import ParticipantBadges from "./pages/participants/Badges.jsx";
import ParticipantNotifications from "./pages/participants/Notifications.jsx";
import EvaluationStart from "./pages/participants/EvaluationStart.jsx";
import EvaluationForm from "./pages/evaluation/EvaluationForm";
import SharedNotifications from "./pages/shared/Notifications";
import SchoolAdminHome from "./pages/school-admins/Home.jsx";
import SchoolAdminReports from "./pages/school-admins/Reports.jsx";
import MisDashboard from "./pages/mis/Dashboard";
import UserManagement from "./pages/mis/UserManagement";
import UserRoles from "./pages/mis/UserRoles";
import ClubOfficerLayout from "./components/club-officers/ClubOfficerLayout";
import PSASLayout from "./components/psas/PSASLayout";
import SchoolAdminLayout from "./components/school-admins/SchoolAdminLayout";
import ClubAdviserLayout from "./components/club-advisers/ClubAdviserLayout";
import MisLayout from "./components/mis/MisLayout";
import Profile from "./pages/Profile";
import Settings from "./pages/mis/Settings";
import MISSharedReports from "./pages/mis/MISSharedReports";
import LexiconManagement from "./pages/mis/LexiconManagement";
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
import GeneralSettings from "./pages/mis/settings/GeneralSettings";
import SecuritySettings from "./pages/mis/settings/SecuritySettings";
import AuditLogs from "./pages/mis/AuditLogs";
import UserStatistics from "./pages/mis/UserStatistics";
import SystemHealth from "./pages/mis/SystemHealth";
import SecurityOversight from "./pages/mis/SecurityOversight";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

import MaintenanceOverlay from "./components/shared/MaintenanceOverlay";

function App() {
  const { user, token, isLoading, systemStatus } = useAuth();

  const getHomeRoute = () => {
    if (!token) return "/login";
    if (!user) return "/login"; // Don't redirect during loading

    switch (user.role) {
      case "psas":
        return "/psas/home";
      case "club-officer":
        return "/club-officer/home";
      case "student":
        return "/student/home"; // Always redirect to full path
      case "senior-management":
        return "/senior-management/home";
      case "club-adviser":
        return "/club-adviser/home";
      case "mis":
        return "/mis";
      case "evaluator":
        return "/student/home"; // Guest evaluators use student interface
      case "guest-speaker":
        return "/student/home"; // Guest speakers use student interface
      default:
        return "/login";
    }
  };

  // Show system maintenance/lockdown overlay
  if (systemStatus?.active) {
    return <MaintenanceOverlay status={systemStatus} />;
  }

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

  // Check if user can access student routes (student or guest users)
  const canAccessStudentRoutes = () => {
    return isAuthorized("student") || isGuest();
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
            <Route
              path="/club-officer/reports/prepared-by"
              element={
                isAuthorized("club-officer") ? (
                  <ReportSharingPage />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            {/* Club Adviser routes */}
            <Route
              path="/club-adviser/home"
              element={
                isAuthorized("club-adviser") ? (
                  <ClubAdviserHome />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-adviser/reports"
              element={
                isAuthorized("club-adviser") ? (
                  <ClubAdviserReports />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-adviser/reports/:eventId"
              element={
                isAuthorized("club-adviser") ? (
                  <CompleteReport />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-adviser/notifications"
              element={
                isAuthorized("club-adviser") ? (
                  <SharedNotifications layout={ClubAdviserLayout} />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-adviser/profile"
              element={
                isAuthorized("club-adviser") ? (
                  <ClubAdviserLayout>
                    <Profile />
                  </ClubAdviserLayout>
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/club-adviser"
              element={<Navigate to="/club-adviser/home" />}
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
            {/* Student routes */}
            <Route
              path="/student/home"
              element={
                canAccessStudentRoutes() ? (
                  <ParticipantHome />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route path="/student" element={<Navigate to="/student/home" />} />
            <Route
              path="/student/evaluations"
              element={
                canAccessStudentRoutes() ? (
                  <ParticipantEvaluations />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/student/certificates"
              element={
                canAccessStudentRoutes() ? (
                  <ParticipantCertificates />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/student/certificate/:certificateId"
              element={
                canAccessStudentRoutes() ? (
                  <ParticipantCertificates />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/student/badges"
              element={
                canAccessStudentRoutes() ? (
                  <ParticipantBadges />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/student/notifications"
              element={
                canAccessStudentRoutes() ? (
                  <ParticipantNotifications />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/evaluations/start/:formId"
              element={
                canAccessStudentRoutes() || isAuthorized("club-officer") ? (
                  <EvaluationStart />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/evaluations/form/:formId"
              element={
                canAccessStudentRoutes() || isAuthorized("club-officer") ? (
                  <EvaluationForm />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            {/* Senior Management routes */}
            <Route
              path="/senior-management/home"
              element={
                isAuthorized("senior-management") ? (
                  <SchoolAdminHome />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/senior-management/reports"
              element={
                isAuthorized("senior-management") ? (
                  <SchoolAdminReports />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/senior-management/reports/:reportId"
              element={
                isAuthorized("senior-management") ? (
                  <SchoolAdminReports />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/senior-management/notifications"
              element={
                isAuthorized("senior-management") ? (
                  <SharedNotifications layout={SchoolAdminLayout} />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/senior-management/profile"
              element={
                isAuthorized("senior-management") ? (
                  <SchoolAdminLayout>
                    <Profile />
                  </SchoolAdminLayout>
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/senior-management"
              element={<Navigate to="/senior-management/home" />}
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
              path="/mis/user-roles"
              element={
                isAuthorized("mis") ? (
                  <MisLayout>
                    <UserRoles />
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
            />
            <Route
              path="/mis/lexicon"
              element={
                isAuthorized("mis") ? (
                  <MisLayout>
                    <LexiconManagement />
                  </MisLayout>
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/mis/security-oversight"
              element={
                isAuthorized("mis") ? (
                  <MisLayout>
                    <SecurityOversight />
                  </MisLayout>
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/mis/reports"
              element={
                isAuthorized("mis") ? (
                  <MISSharedReports />
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/mis/audit-logs"
              element={
                isAuthorized("mis") ? (
                  <MisLayout>
                    <AuditLogs />
                  </MisLayout>
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/mis/user-statistics"
              element={
                isAuthorized("mis") ? (
                  <MisLayout>
                    <UserStatistics />
                  </MisLayout>
                ) : (
                  <Navigate to={getHomeRoute()} />
                )
              }
            />
            <Route
              path="/mis/system-health"
              element={
                isAuthorized("mis") ? (
                  <MisLayout>
                    <SystemHealth />
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
            {/* Catch all route - 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </OnboardingProvider>
    </NotificationProvider>
  );
}

export default App;
