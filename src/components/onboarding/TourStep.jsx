import React from "react";

function TourStep({ title, description, position, step, totalSteps, onSkip, onContinue, onDone, showDone = false }) {
  // Position styles for different elements
  const getPositionStyles = () => {
    switch (position) {
      case 'sidebar':
        return {
          container: 'left-32 top-1/2 transform -translate-y-1/2',
          arrow: 'left-[-8px] top-1/2 transform -translate-y-1/2',
          highlight: 'left-0 top-0 w-16 h-full'
        };
      case 'header':
        return {
          container: 'top-32 right-4',
          arrow: 'top-[-8px] left-[310px] transform -translate-x-1/2',
          highlight: 'top-0 right-5 w-96 h-16'
        };
      case 'recent-activity':
        return {
          container: 'top-60 left-30',
          arrow: 'bottom-[-8px] right-[270px] transform -translate-x-1/2',
          highlight: 'bottom-0 left-0 right-64 h-96'
        };
      default:
        return {
          container: 'left-32 top-1/2 transform -translate-y-1/2',
          arrow: 'left-[-8px] top-1/2 transform -translate-y-1/2',
          highlight: 'left-0 top-0 w-16 h-full'
        };
    }
  };

  const pos = getPositionStyles();

  return (
    <>
      {/* Backdrop blur - exclude sidebar, header, or recent activity area */}
      <div
        className={`fixed inset-0 bg-white/50 z-40 ${
          position === "sidebar"
            ? "left-[130px]"
            : position === "header"
            ? "top-[100px] left-[130px]"
            : position === "recent-activity"
            ? "top-[500px] left-[1290px]"
            : ""
        }`}
      />

      {/* Light dark overlay - exclude sidebar, header, or recent activity area */}
      <div
        className={`fixed inset-0 bg-[#F1F0F0]/50 z-45 ${
          position === "sidebar"
            ? "left-[130px]"
            : position === "header"
            ? "top-[120px] left-[130px]"
            : position === "recent-activity"
            ? "top-[500px] left-[1290px]"
            : ""
        }`}
      />

      {/* Tour Step Modal */}
      <div className={`fixed ${pos.container} z-50 p-4 max-w-sm`}>
        <div className="bg-white rounded-lg shadow-xl p-6 relative">
          {/* Arrow pointing to element */}
          <div
            className={`absolute ${pos.arrow} w-0 h-0 ${
              position === "sidebar"
                ? "border-t-8 border-b-8 border-r-8 border-transparent border-r-white"
                : position === "header"
                ? "border-l-8 border-r-8 border-b-8 border-transparent border-b-white"
                : position === "recent-activity"
                ? "border-l-8 border-r-8 border-t-8 border-transparent border-t-white"
                : "border-t-8 border-b-8 border-r-8 border-transparent border-r-white"
            }`}
          ></div>

          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">
              Step {step} of {totalSteps}
            </span>
            <div className="flex space-x-2">
              {!showDone && (
                <button
                  onClick={onSkip}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Skip
                </button>
              )}
              {!showDone ? (
                <button
                  onClick={onContinue}
                  className="bg-[#1F3463] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={onDone}
                  className="bg-[#1F3463] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 hover:scale-105 transition-colors"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TourStep;
