import ParticipantLayout from "../../components/participants/ParticipantLayout";
import { Search } from 'lucide-react';

const Certificates = () => {
  const certificates = [
    { title: "Foundation Week Celebration", image: "https://placehold.co/400x300/FFFFFF/000000?text=Certificate" },
    { title: "Child Protection Seminar", image: "https://placehold.co/400x300/FFFFFF/000000?text=Certificate" },
    { title: "Intramurals", image: "https://placehold.co/400x300/FFFFFF/000000?text=Certificate" },
    { title: "Graduation Day 2025", image: "https://placehold.co/400x300/FFFFFF/000000?text=Certificate" },
    { title: "8th ICT Week Celebration", image: "https://placehold.co/400x300/FFFFFF/000000?text=Certificate" },
    { title: "Study Habits Seminar", image: "https://placehold.co/400x300/FFFFFF/000000?text=Certificate" },
    { title: "Data Privacy Week 2025", image: "https://placehold.co/400x300/FFFFFF/000000?text=Certificate" },
    { title: "Buwan ng Wika 2025", image: "https://placehold.co/400x300/FFFFFF/000000?text=Certificate" },
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
                placeholder="Search Certificates"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {certificates.map((cert, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 text-center cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gray-200 rounded-md mb-4 overflow-hidden">
                    <img src={cert.image} alt={cert.title} className="w-full h-auto object-cover rounded-md hover:scale-105 transition-transform duration-300" />
                </div>
                <h3 className="font-semibold text-gray-800">{cert.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default Certificates;