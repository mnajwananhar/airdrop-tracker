"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const Toast = ({ id, message, type = "success", onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);

    // Allow for fade out animation before completely removing
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  // Determine icon and colors based on notification type
  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: (
            <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
          ),
          bgColor: "bg-green-900/30",
          borderColor: "border-green-500",
          textColor: "text-green-300",
        };
      case "error":
        return {
          icon: (
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          ),
          bgColor: "bg-red-900/30",
          borderColor: "border-red-500",
          textColor: "text-red-300",
        };
      case "warning":
        return {
          icon: (
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
          ),
          bgColor: "bg-amber-900/30",
          borderColor: "border-amber-500",
          textColor: "text-amber-300",
        };
      case "info":
      default:
        return {
          icon: <Info size={18} className="text-blue-400 flex-shrink-0" />,
          bgColor: "bg-blue-900/30",
          borderColor: "border-blue-500",
          textColor: "text-blue-300",
        };
    }
  };

  const { icon, bgColor, borderColor, textColor } = getToastStyles();

  return (
    <div
      className={`flex items-start sm:items-center p-3 sm:p-4 rounded-lg shadow-lg border ${bgColor} ${borderColor} transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } mb-3 max-w-full break-words`}
    >
      <div className="mr-2 sm:mr-3 mt-0.5 sm:mt-0">{icon}</div>
      <div className={`flex-1 text-sm sm:text-base ${textColor} pr-2`}>
        {message}
      </div>
      <button
        onClick={handleClose}
        className="ml-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 p-1 flex-shrink-0 self-start"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
