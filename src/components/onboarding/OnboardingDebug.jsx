import React from "react";
import { useOnboarding } from "../../hooks/useOnboarding.js";
import { useAuth } from "../../contexts/useAuth";

function OnboardingDebug() {
  const { debugOnboarding, forceStartOnboarding, isOnboarding, currentStep } = useOnboarding();
  const { user } = useAuth();

  // Always show for testing purposes
  // if (process.env.NODE_ENV !== 'development') {
  //   return null;
  // }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">🔧 Onboarding Debug</h3>
      
      <div className="space-y-2 text-xs">
        <div><strong>User Role:</strong> {user?.role || 'None'}</div>
        <div><strong>isOnboarding:</strong> {isOnboarding ? 'true' : 'false'}</div>
        <div><strong>currentStep:</strong> {currentStep}</div>
        <div><strong>hasCompleted:</strong> {user?.hasCompletedOnboarding ? 'true' : 'false'}</div>
        <div><strong>onboardingStep:</strong> {user?.onboardingStep}</div>
      </div>

      <div className="mt-3 space-y-2">
        <button
          onClick={debugOnboarding}
          className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          Debug Info
        </button>
        
        <button
          onClick={forceStartOnboarding}
          className="w-full bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
        >
          Force Start
        </button>

        <button
          onClick={() => {
            const updatedUser = {
              ...user,
              hasCompletedOnboarding: false,
              onboardingStep: 0,
              onboardingCompletedAt: null
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.location.reload();
          }}
          className="w-full bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs"
        >
          Reset User
        </button>
      </div>
    </div>
  );
}

export default OnboardingDebug;