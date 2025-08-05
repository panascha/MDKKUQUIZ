"use client";

import Image from "next/image";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <Image
              src="/mdkkulogo.png"
              alt="MDKKU Logo"
              width={80}
              height={80}
              className="mx-auto"
            />
          </div>

          {/* Maintenance Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Website Under Maintenance
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            We're currently performing scheduled maintenance to improve your experience. 
            The website will be back online shortly.
          </p>

          {/* Status */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
              <span className="text-yellow-800 font-medium">Maintenance in Progress</span>
            </div>
          </div>
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              © 2025 MDKKU Quiz System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
