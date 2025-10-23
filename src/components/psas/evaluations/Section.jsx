import { useState } from "react";
import {
    MoreVertical,
    Trash2,
    Star,
    ChevronsDownUp,
  } from "lucide-react";

const Section = ({ id, title, description, onRemove }) => {
    const [showMenu, setShowMenu] = useState(false);
    return (
      <div className="relative mt-8">
        <div className="relative top-6 left-0 z-10">
          <span className="px-4 py-1 text-sm text-white bg-blue-600 rounded-t-md">
            New Section
          </span>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-10 mt-6 mb-6 relative min-h-[220px]">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border">
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Star size={16} className="mr-3" /> Star
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <ChevronsDownUp size={16} className="mr-3" /> Move to folder
                </a>
              </div>
            )}
          </div>
  
          <input
            type="text"
            defaultValue={title}
            className="text-3xl sm:text-5xl font-bold w-full border-none outline-none mb-4"
          />
          <textarea
            placeholder={description}
            className="w-full text-base sm:text-lg text-gray-600 border-none outline-none resize-none"
            rows={1}
          />
          <div className="absolute bottom-4 right-4">
            <button
              onClick={() => onRemove(id)}
              className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-100"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default Section;