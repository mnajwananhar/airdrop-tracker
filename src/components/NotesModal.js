"use client";

import { X, FileText } from "lucide-react";

const NotesModal = ({
  activeProjectNotes,
  setShowNotesModal,
  setActiveProjectNotes,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-0 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md p-4 sm:p-8 my-4 sm:my-0 max-h-[90vh] sm:max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center min-w-0 flex-1 mr-2">
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-800 mr-2 sm:mr-3 flex-shrink-0">
              <FileText size={18} className="text-yellow-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
              {activeProjectNotes.name}
            </h2>
          </div>
          <button
            onClick={() => {
              setShowNotesModal(false);
              setActiveProjectNotes(null);
            }}
            className="text-gray-400 hover:text-white rounded-full hover:bg-gray-700 p-1 sm:p-2 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-auto scrollbar-container bg-gray-800 rounded-lg p-3 sm:p-5 mb-4 sm:mb-6">
          <div className="prose prose-invert max-w-none">
            <h3 className="flex items-center text-gray-300 text-base sm:text-lg mb-3 sm:mb-4">
              <FileText
                size={16}
                className="text-yellow-400 mr-2 flex-shrink-0"
              />
              Notes
            </h3>
            {activeProjectNotes.notes ? (
              <p className="whitespace-pre-line text-gray-300 text-sm sm:text-base">
                {activeProjectNotes.notes}
              </p>
            ) : (
              <p className="text-gray-500 italic text-sm sm:text-base">
                No additional notes for this project.
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => {
              setShowNotesModal(false);
              setActiveProjectNotes(null);
            }}
            className="px-4 sm:px-5 py-2 sm:py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 font-medium transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;
