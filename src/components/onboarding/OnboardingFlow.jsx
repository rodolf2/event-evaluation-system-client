import React, { useState } from "react";
import { useOnboarding } from "../../hooks/useOnboarding.js";
import { useAuth } from "../../contexts/useAuth";
import WelcomeModal from "./WelcomeModal";
import TourStep from "./TourStep";

function OnboardingFlow() {
  const { user } = useAuth();
  const { skipOnboarding, completeOnboarding } = useOnboarding();
  const [currentTourStep, setCurrentTourStep] = useState(0); // 0 = welcome, 1-3 = tour steps

  if (!user) return null;

  // Show welcome modal first
  if (currentTourStep === 0) {
    return <WelcomeModal onGotIt={() => setCurrentTourStep(1)} />;
  }

  // Tour steps
  const tourSteps = [
    {
      title: "Sidebar Navigation",
      description:
        "This is the sidebar navigation. Through this, it will redirect you to the different functionalities of the system.",
      position: "sidebar",
    },
    {
      title: "Header",
      description:
        "This is the header. This contains the menu for account and logout that you will need in order to edit your profile or log out of your account",
      position: "header",
    },
    {
      title: "Recent Activity",
      description:
        "This is the recent activity section. This area lists the recent activities that you have done with the system, allowing you to see what activities or changes you have made.",
      position: "recent-activity",
    },
  ];

  const currentStepData = tourSteps[currentTourStep - 1];
  const isLastStep = currentTourStep === tourSteps.length;

  const handleContinue = () => {
    if (isLastStep) {
      completeOnboarding();
    } else {
      setCurrentTourStep(currentTourStep + 1);
    }
  };

  const handleSkip = () => {
    skipOnboarding();
  };

  return (
    <TourStep
      title={currentStepData.title}
      description={currentStepData.description}
      position={currentStepData.position}
      step={currentTourStep}
      totalSteps={3}
      onSkip={handleSkip}
      onContinue={handleContinue}
      onDone={handleContinue}
      showDone={isLastStep}
    />
  );
}

export default OnboardingFlow;
