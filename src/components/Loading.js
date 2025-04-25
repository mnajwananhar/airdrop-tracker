"use client";

import { Balloon } from "./Header";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="animate-bounce mb-4">
          <Balloon size={64} className="text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
          Airdrop Tracker
        </h2>
        <div className="mt-4">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p className="text-gray-400 mt-4">Loading application...</p>
      </div>
    </div>
  );
}
