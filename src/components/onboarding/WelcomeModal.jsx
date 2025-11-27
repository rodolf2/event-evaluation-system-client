import React from "react";

function WelcomeModal({ onGotIt }) {
  return (
    <>
      {/* Background with backdrop blur effect */}
      <div className="fixed inset-0 bg-[#F1F0F0]/80 z-40 modal-overlay" />

      {/* Welcome Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Welcome Aboard!
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Hi there! Nice to see you here!
            </p>
            <p className="text-gray-600 text-base leading-relaxed mt-2">
              Let's have a quick tour of the Evaluation System for School and Program Events with Data-Driven Feedback Analysis and Performance Reports.
            </p>
          </div>

          <button
            onClick={onGotIt}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
}

export default WelcomeModal;