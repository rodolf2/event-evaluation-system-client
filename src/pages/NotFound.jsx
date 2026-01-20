import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useAuth } from "../contexts/useAuth";

const NotFound = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const getHomeRoute = () => {
    if (!token || !user) return "/login";

    switch (user.role) {
      case "psas":
        return "/psas/home";
      case "club-officer":
        return "/club-officer/home";
      case "student":
        return "/student/home";
      case "senior-management":
        return "/senior-management/home";
      case "mis":
        return "/mis";
      case "evaluator":
      case "guest-speaker":
        return "/student/home";
      default:
        return "/login";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#1F3463] via-[#2d4a8c] to-[#1F3463] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="relative inline-block">
            <span className="text-[100px] sm:text-[130px] md:text-[170px] lg:text-[200px] font-bold text-white/15 leading-none select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center mt-6 sm:mt-8 md:mt-10 ml-2 sm:ml-3 md:ml-4">
              <Search className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 text-white/40" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl border border-white/20">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 md:mb-4">
            Page Not Found
          </h1>
          <p className="text-blue-100 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8 px-2">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 text-white text-sm sm:text-base rounded-lg transition-all duration-300 border border-white/30"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Go Back
            </button>
            <button
              onClick={() => navigate(getHomeRoute())}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-white text-[#1F3463] text-sm sm:text-base rounded-lg hover:bg-blue-50 transition-all duration-300 font-medium shadow-lg"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              Return Home
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <p className="mt-4 sm:mt-6 md:mt-8 text-blue-200/60 text-xs sm:text-sm px-4">
          If you believe this is an error, please contact the administrator.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
