'use client';

import React, { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const BanPage = () => {
  const { user } = useUser();
  const status = user?.status;
  const router = useRouter();
  const [showKidding, setShowKidding] = useState(false);

  let daysLeft = null;
  if (status?.banUntil) {
    const now = new Date();
    const until = new Date(status.banUntil);
    daysLeft = Math.max(0, Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-2 sm:px-4">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 max-w-xs sm:max-w-md w-full text-center mb-8">
        <div className="mx-auto mb-6 rounded-lg shadow overflow-hidden w-full" style={{ maxWidth: 320, height: 'auto' }}>
          <Image
            src="https://media1.tenor.com/m/x8v1oNUOmg4AAAAd/rickroll-roll.gif"
            alt="Rickroll"
            width={320}
            height={180}
            className="w-full h-auto object-cover"
            style={{ objectFit: 'cover' }}
            unoptimized
            priority
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4">You have been rickrolled (Banned) for {status?.banUntil ? `${daysLeft} days` : 'eternity'}</h1>
        <p className="text-base sm:text-lg mb-2">Reason</p>
        <p className="text-sm sm:text-base text-gray-700 mb-4">{status?.banReason || "Admin just want to rickrolled you. when they're satisfied, they will unban you."}</p>
        <p className="text-gray-400 text-xs sm:text-sm mt-6">If you believe this is a mistake, please contact panasch@kkumail.com</p>
      </div>
      {(!status?.isBanned) && (
        <>
          <button
            className="mb-4 text-3xl text-gray-500 hover:text-gray-700 focus:outline-none transition"
            aria-label="Show just kidding card"
            onClick={() => setShowKidding((prev) => !prev)}
          >
            <span style={{ display: 'inline-block', transform: showKidding ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </button>
          {showKidding && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 max-w-xs sm:max-w-md w-full text-center animate-fade-in">
              <h1 className="text-2xl sm:text-3xl font-bold text-green-600 mb-4">Just kidding!</h1>
              <p className="mb-6">You are not actually banned. Click the button below to go to the home page.</p>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={() => router.push('/home')}
              >
                Go to Home Page
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BanPage;
