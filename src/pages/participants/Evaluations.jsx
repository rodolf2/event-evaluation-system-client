import ParticipantLayout from "../../components/participants/ParticipantLayout";
import { Search, ChevronRight } from 'lucide-react';

const Evaluations = () => {
  const evaluations = [
    {
      title: "Sample Event Evaluation Form",
      openDate: "August 14, 2025",
      closeDate: "August 19, 2025",
    },
    {
      title: "8th ICT Week Celebration Event Evaluation Form",
      openDate: "August 14, 2025",
      closeDate: "August 19, 2025",
    },
    {
      title: "College Level Intramurals Event Evaluation Form",
      openDate: "August 14, 2025",
      closeDate: "August 19, 2025",
    },
    {
      title: "Child Protection Seminar Event Evaluation Form",
      openDate: "August 14, 2025",
      closeDate: "August 19, 2025",
    },
    {
      title: "Study Habits Seminar Event Evaluation Form",
      openDate: "August 14, 2025",
      closeDate: "August 19, 2025",
    },
    {
      title: "Graduation Ceremony '25 Event Evaluation Form",
      openDate: "August 14, 2025",
      closeDate: "August 19, 2025",
    },
    {
      title: "LVCC Foundation Week Event Evaluation Form",
      openDate: "August 14, 2025",
      closeDate: "August 19, 2025",
    },
    {
      title: "Program Orientation Event Evaluation Form",
      openDate: "August 14, 2025",
      closeDate: "August 19, 2025",
    },
  ];

  return (
    <ParticipantLayout>
      <div className="bg-gray-100 min-h-screen pb-8">
        <div className="max-w-full">
          <div className="flex items-center mb-8 gap-4">
            <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <button className="bg-white p-3 rounded-lg border border-gray-300 flex items-center text-gray-700 w-full justify-center sm:w-auto">
                <span className="w-3 h-3 bg-blue-600 mr-2 rounded-sm"></span>
                <span>Event</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {evaluations.map((evaluation, index) => (
              <div key={index} className="bg-[linear-gradient(-0.15deg,_#324BA3_38%,_#002474_100%)] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <div className="bg-white rounded-r-lg ml-3 p-8 flex items-center h-full">
                    <div className="grow">
                      <h3 className="font-bold text-2xl mb-4 text-gray-800">{evaluation.title}</h3>
                      <div className="text-sm text-gray-500 space-x-4">
                        <span>Open: {evaluation.openDate}</span>
                        <span>Closes: {evaluation.closeDate}</span>
                      </div>
                    </div>
                    <div className="ml-4 text-gray-400">
                      <ChevronRight className="h-6 w-6" />
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default Evaluations;