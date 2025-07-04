import React from 'react';
import { UserStat } from '@/types/api/Stat';
import Image from 'next/image';

interface LeaderBoardSectionProps {
  isLoading: boolean;
  error: Error | null;
  leaderboard: UserStat[] | undefined;
  currentUserId?: string;
}

const topBorders = [
  'border-l-4 border-yellow-400', // Gold
  'border-l-4 border-gray-400',   // Silver
  'border-l-4 border-amber-500',  // Bronze
];

const LeaderBoardSection: React.FC<LeaderBoardSectionProps> = ({ isLoading, error, leaderboard, currentUserId }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mt-2 border border-gray-200">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
        🏆 Leaderboard ( Most creating )
      </h2>
      {isLoading ? (
        <p className="text-gray-500 animate-pulse">Loading leaderboard...</p>
      ) : error ? (
        <p className="text-red-500 font-medium">{error.message}</p>
      ) : leaderboard && leaderboard.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <table
            className="min-w-[340px] w-full text-xs sm:text-sm border-separate border-spacing-0"
            aria-label="Leaderboard table"
          >
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="px-3 py-2 border-b text-left font-semibold whitespace-nowrap">#</th>
                <th className="px-3 py-2 border-b text-left font-semibold whitespace-nowrap">Name</th>
                <th className="px-3 py-2 border-b text-left font-semibold whitespace-nowrap">Quiz</th>
                <th className="px-3 py-2 border-b text-left font-semibold whitespace-nowrap">Keyword</th>
                <th className="px-3 py-2 border-b text-left font-semibold whitespace-nowrap">Report</th>
                <th className="px-3 py-2 border-b text-left font-semibold whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.slice(0, 10).map((u, idx) => {
                const isTop3 = idx < 3;
                const isCurrent = currentUserId && u.user._id === currentUserId;
                return (
                  <tr
                    key={u.user._id}
                    className={
                      `${isTop3 ? topBorders[idx] + ' font-bold text-base sm:text-lg' : ''} ` +
                      `${isCurrent ? 'bg-blue-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ` +
                      'hover:bg-gray-100 transition border-b border-gray-200'
                    }
                  >
                    <td className="px-3 py-2 border-b whitespace-nowrap text-gray-800">{idx + 1}</td>
                    <td className="px-3 py-2 border-b whitespace-nowrap flex items-center gap-1 text-gray-800">
                      <span>{u.user.name}</span>
                      {idx === 0 && (
                        <Image src="/CrownIcon.png" alt="Crown" width={18} height={18} className="ml-2 inline-block align-middle" />
                      )}
                    </td>
                    <td className="px-3 py-2 border-b whitespace-nowrap text-gray-800">{u.quizCount}</td>
                    <td className="px-3 py-2 border-b whitespace-nowrap text-gray-800">{u.keywordCount}</td>
                    <td className="px-3 py-2 border-b whitespace-nowrap text-gray-800">{u.reportCount}</td>
                    <td className="px-3 py-2 border-b whitespace-nowrap font-bold text-blue-700">{u.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">No leaderboard data available.</p>
      )}
    </div>
  );
};

export default LeaderBoardSection;
