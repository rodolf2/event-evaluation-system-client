import React from "react";
import { useOnboarding } from "../../hooks/useOnboarding.js";
import { useAuth } from "../../contexts/useAuth";
import OnboardingFlow from "./OnboardingFlow";

function OnboardingWrapper() {
  const { isOnboarding } = useOnboarding();
  const { user } = useAuth();

  // Only show onboarding if user exists and hasn't completed onboarding
  if (!user || !isOnboarding) {
    return null;
  }

  return <OnboardingFlow />;
}

export default OnboardingWrapper;