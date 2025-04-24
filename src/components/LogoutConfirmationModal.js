"use client";

const LogoutConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">
          Confirm Logout
        </h3>
        <p className="text-gray-300 mb-6">
          Are you sure you want to logout from the application?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationModal;
