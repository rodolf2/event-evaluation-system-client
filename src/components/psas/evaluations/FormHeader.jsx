import { useState } from "react";

const FormHeader = ({ formTitle, setFormTitle, formDescription, setFormDescription }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Form Title *
        </label>
        {isEditingTitle ? (
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
            className="w-full text-2xl font-bold border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditingTitle(true)}
            className="w-full text-2xl font-bold cursor-pointer hover:bg-gray-50 rounded-md px-3 py-2 min-h-12 flex items-center"
          >
            {formTitle || "Click to add form title"}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Form Description
        </label>
        {isEditingDesc ? (
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            onBlur={() => setIsEditingDesc(false)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none min-h-16"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditingDesc(true)}
            className="w-full cursor-pointer hover:bg-gray-50 rounded-md px-3 py-2 min-h-16 flex items-start"
          >
            {formDescription || "Click to add form description"}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormHeader;