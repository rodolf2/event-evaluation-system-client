function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6 sm:p-8 bg-white">
        <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-md h-full justify-center">
          {/* Logo */}
          <img
            src="src/assets/logo/LOGO.png"
            alt="School Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 mb-4"
          />

          {/* Welcome Text */}
          <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center">
            Welcome!
          </h1>
          <p className="text-gray-600 mb-8 text-center text-sm sm:text-base">
            Sign in with your Google account to continue
          </p>

          {/* Google Sign-In Button */}
          <button onClick={handleGoogleLogin} className="w-full border flex items-center justify-center py-3 rounded-md hover:bg-gray-100 bg-white text-gray-700 font-medium transition">
            <img
              src="src/assets/logo/google-logo.png"
              alt="Google"
              className="w-5 h-5 mr-3"
            />
            Sign in with Google
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 bg-white p-4 sm:p-6 lg:p-8">
        <div className="relative w-full h-full min-h-[50vh] lg:min-h-0 rounded-2xl overflow-hidden flex items-center justify-center">
          {/* Background Image */}
          <img
            src="src/assets/background-image/LV2.jpg"
            alt="La Verdad Christian College Background"
            className="w-full h-full object-cover"
          />

          {/* Blue Overlay */}
          <div className="absolute inset-0 bg-blue-950 opacity-80"></div>

          {/* Text Content */}
          <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center p-6">
            <div className="max-w-md">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold mb-4 text-white uppercase tracking-wider">
                Evaluation System for School and Program Events
              </h2>
              <p className="text-xs sm:text-sm md:text-base lg:text-base mb-8 text-white/90">
                An Intuitive and Engaging Event Evaluation System for La Verdad
                Christian College – Apalit, Pampanga
              </p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                Go to Guest Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
