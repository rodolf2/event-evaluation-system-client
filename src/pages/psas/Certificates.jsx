import PSASLayout from "../../components/psas/PSASLayout";
import {Search, Filter } from "lucide-react";
import blankFormIcon from "../../assets/icons/blankform-icon.svg";

const Evaluations = () => {

  return (
    <PSASLayout>
      <div className="p-6 md:p-5 bg-gray-50 h-screen flex flex-col">
        {/* Create Certificate */}
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Create a certificate
          </h2>
          <div className="mb-7">
            <div
              className="mb-8 text-white p-8 rounded-xl shadow-lg"
              style={{
                background:
                  "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Blank Form Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 sm:p-16 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center mx-auto mb-4">
                    <img
                      src={blankFormIcon}
                      alt="Blank Form"
                      className="w-10 h-10 sm:w-16 sm:h-16"
                    />
                  </div>
                </div>
              </div>

              {/* Labels Below Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mt-8">
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                    Blank Canvas
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PSASLayout>
  );
};

export default Evaluations;
