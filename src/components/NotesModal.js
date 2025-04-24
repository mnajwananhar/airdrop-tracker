"use client";

import { X, FileText } from "lucide-react";

const NotesModal = ({
  activeProjectNotes,
  setShowNotesModal,
  setActiveProjectNotes,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md p-8 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 mr-3">
              <FileText size={20} className="text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {activeProjectNotes.name}
            </h2>
          </div>
          <button
            onClick={() => {
              setShowNotesModal(false);
              setActiveProjectNotes(null);
            }}
            className="text-gray-400 hover:text-white rounded-full hover:bg-gray-700 p-2"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar bg-gray-800 rounded-lg p-5 mb-6">
          <div className="prose prose-invert max-w-none">
            <h3 className="flex items-center text-gray-300 text-lg mb-4">
              <FileText size={18} className="text-yellow-400 mr-2" />
              Notes
            </h3>
            {activeProjectNotes.notes ? (
              <p className="whitespace-pre-line text-gray-300">
                {activeProjectNotes.notes}
              </p>
            ) : (
              <p className="text-gray-500 italic">
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
            className="px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 font-medium transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;
