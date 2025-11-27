import React, { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

const OnboardingContext = React.createContext();

export { OnboardingContext };

export function OnboardingProvider({ children }) {
  const { user, updateUser, token } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({});

  // Initialize onboarding state when user changes
  useEffect(() => {
    if (user) {
      // Handle cases where onboarding fields might be missing or undefined
      const hasCompletedOnboarding = user.hasCompletedOnboarding === true;
      const hasOnboardingStep = user.onboardingStep !== undefined && user.onboardingStep !== null;
      
      if (!hasCompletedOnboarding && hasOnboardingStep) {
        setCurrentStep(user.onboardingStep);
        setIsOnboarding(true);
      } else if (!hasCompletedOnboarding && !hasOnboardingStep) {
        // User hasn't completed onboarding but no step set - start from beginning
        setCurrentStep(0);
        setIsOnboarding(true);
      } else {
        setIsOnboarding(false);
        setCurrentStep(0);
      }
    }
  }, [user]);

  // Simplified onboarding for tour-style experience
  const getOnboardingSteps = () => {
    // For now, just return a simple array for participants
    // This can be expanded for other roles later
    return [
      { title: "Welcome", component: "WelcomeModal" },
      { title: "Sidebar Tour", component: "TourStep" },
      { title: "Header Tour", component: "TourStep" },
      { title: "Activity Tour", component: "TourStep" }
    ];
  };

  const nextStep = async () => {
    const steps = getOnboardingSteps(user?.role);
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // Update user onboarding step
      if (token) {
        try {
          const response = await fetch("/api/auth/profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              onboardingStep: newStep
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            updateUser(data.data.user);
          }
        } catch (error) {
          console.error("Error updating onboarding step:", error);
        }
      }
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = async () => {
    setIsOnboarding(false);
    
    if (token) {
      try {
        const response = await fetch("/api/auth/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            hasCompletedOnboarding: true,
            onboardingStep: getOnboardingSteps(user?.role).length - 1,
            onboardingCompletedAt: new Date()
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          updateUser(data.data.user);
        }
      } catch (error) {
        console.error("Error completing onboarding:", error);
      }
    }
  };

  const completeOnboarding = async () => {
    setIsOnboarding(false);
    
    if (token) {
      try {
        const response = await fetch("/api/auth/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            hasCompletedOnboarding: true,
            onboardingStep: getOnboardingSteps(user?.role).length - 1,
            onboardingCompletedAt: new Date()
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          updateUser(data.data.user);
        }
      } catch (error) {
        console.error("Error completing onboarding:", error);
      }
    }
  };

  const restartOnboarding = () => {
    setCurrentStep(0);
    setIsOnboarding(true);
    setOnboardingData({});
  };

  // Debug function to check onboarding state
  const debugOnboarding = () => {
    console.log('Current user:', user);
    console.log('isOnboarding:', isOnboarding);
    console.log('currentStep:', currentStep);
    console.log('hasCompletedOnboarding:', user?.hasCompletedOnboarding);
    console.log('onboardingStep:', user?.onboardingStep);
  };

  // Force start onboarding (for testing)
  const forceStartOnboarding = () => {
    setCurrentStep(0);
    setIsOnboarding(true);
    setOnboardingData({});
    console.log('Forced onboarding to start');
  };

  const value = {
    currentStep,
    setCurrentStep,
    isOnboarding,
    setIsOnboarding,
    onboardingData,
    setOnboardingData,
    getOnboardingSteps,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    restartOnboarding,
    debugOnboarding,
    forceStartOnboarding
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Hook is exported in a separate file for better Fast Refresh support