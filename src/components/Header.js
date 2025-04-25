"use client";

import { PlusCircle, RefreshCw, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import LogoutConfirmationModal from "./LogoutConfirmationModal";
import ProfileAvatar from "./ProfileAvatar";

export const Balloon = ({ size = 24, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C7.58172 2 4 5.58172 4 10C4 13.3894 6.05452 16.2698 9 17.3833V19H15V17.3833C17.9455 16.2698 20 13.3894 20 10C20 5.58172 16.4183 2 12 2Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8 3.5V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 2V17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 3.5V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <rect
        x="9"
        y="19"
        width="6"
        height="3"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <line
        x1="10"
        y1="17"
        x2="9.5"
        y2="19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="14"
        y1="17"
        x2="14.5"
        y2="19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

const Header = ({
  showCompleted,
  filteredProjects,
  resetAllMarks,
  setShowAddForm,
}) => {
  const { user, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    signOut();
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
      <div className="flex items-center">
        <Balloon size={32} className="text-blue-400 mr-2" />
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Airdrop Tracker
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        {user && (
          <div className="hidden md:flex items-center mr-4">
            <ProfileAvatar
              src={user.photoURL}
              alt={user.displayName || "User profile"}
              size="md"
              className="border-2 border-blue-500"
              fallbackClassName="bg-gray-700 text-gray-400"
            />
            <span className="ml-2 text-sm text-gray-300 font-medium truncate max-w-[120px]">
              {user.displayName || user.email}
            </span>
          </div>
        )}

        {!showCompleted && filteredProjects.length > 0 && (
          <button
            onClick={resetAllMarks}
            className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full transition-all duration-200 border border-gray-700"
            title="Reset all daily checks"
          >
            <RefreshCw size={18} className="text-yellow-400" />
          </button>
        )}
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all duration-200"
          title="Add new project"
        >
          <PlusCircle size={18} />
        </button>

        {user && (
          <button
            onClick={handleLogoutClick}
            className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full transition-all duration-200 border border-gray-700 ml-2"
            title="Logout"
          >
            <LogOut size={18} className="text-red-400" />
          </button>
        )}
      </div>

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
};

export default Header;
