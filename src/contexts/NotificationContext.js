"use client";

import { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/Toast";

// Create the notification context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Function to add a new notification
  const notify = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now(); // Create a unique ID for each notification
    setNotifications((prev) => [...prev, { id, message, type, duration }]);

    // Auto remove notification after duration
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    }, duration);

    return id;
  }, []);

  // Function to remove a notification by ID
  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  // Common notification types
  const success = useCallback(
    (message, duration) => notify(message, "success", duration),
    [notify]
  );

  const error = useCallback(
    (message, duration) => notify(message, "error", duration),
    [notify]
  );

  const info = useCallback(
    (message, duration) => notify(message, "info", duration),
    [notify]
  );

  const warning = useCallback(
    (message, duration) => notify(message, "warning", duration),
    [notify]
  );

  // Value object to be provided by the context
  const value = {
    notifications,
    notify,
    removeNotification,
    success,
    error,
    info,
    warning,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Render the Toasts */}
      <div className="notification-container">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            id={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
