"use client";

import { Balloon } from "../components/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4 text-center">
      <div className="max-w-md w-full space-y-8 mx-auto">
        <div className="flex flex-col items-center">
          <Balloon size={64} className="text-blue-400 mb-6" />
          <h1 className="text-5xl font-bold text-white mb-2">404</h1>
          <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
            Page Not Found
          </h2>
          <p className="text-gray-400 mb-8 max-w-sm">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            might have been moved or deleted.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col items-center space-y-2">
            <p className="text-gray-500 text-sm">Need help? Contact support</p>
            <div className="animate-float">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-30"></div>
                <p className="relative flex items-center justify-center px-4 py-2 bg-gray-800 rounded-full text-blue-400 text-sm">
                  dejanmna2@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-900/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-900/10 rounded-full filter blur-3xl animate-pulse-slow delay-1000"></div>
    </div>
  );
}
