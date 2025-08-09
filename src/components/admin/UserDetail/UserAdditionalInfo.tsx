"use client";

import React from 'react';
import type { Subject } from '../../../types/api/Subject';
import type { UserStat } from '../../../types/api/Stat';
import { ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface Props {
  userStat: UserStat;
  selectedSubject: string;
  selectedSubjectObj: Subject | null;
}

const UserAdditionalInfo: React.FC<Props> = ({ userStat, selectedSubject, selectedSubjectObj }) => {
  return (
    <div className="mt-6 space-y-4">
      {/* Activity Summary */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          📊 Activity Summary {selectedSubject === 'all' ? 'Across All Subjects' : `for ${selectedSubjectObj?.name}`}
        </h3>
        <p className="text-blue-800">
          This user has contributed <strong>{userStat.total}</strong> items in total
          {selectedSubject === 'all' ? ' across all subjects' : ` for ${selectedSubjectObj?.name}`}, 
          including <strong>{userStat.quizCount}</strong> quizzes, <strong>{userStat.keywordCount}</strong> keywords, 
          and submitted <strong>{userStat.reportCount}</strong> reports.
        </p>
      </div>
      
      {/* Quiz Eligibility - Only show for specific subjects */}
      {selectedSubject !== 'all' && selectedSubjectObj && (
        <>
          {userStat.quizCount < 4 ? (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800">Quiz Eligibility Status</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    User needs <strong>{4 - userStat.quizCount}
                    </strong> more quiz contribution(s) 
                    to be eligible for taking quizzes in {selectedSubjectObj.name}.
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(userStat.quizCount / 4) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">
                      Progress: {userStat.quizCount}/4 quizzes ({((userStat.quizCount / 4) * 100).toFixed(0)}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h4 className="text-sm font-semibold text-green-800">Quiz Eligible ✅</h4>
                  <p className="text-green-700 text-sm">
                    User is eligible to take quizzes in {selectedSubjectObj.name} with <strong>{userStat.quizCount}</strong> quiz contributions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Overall Performance for All Subjects */}
      {selectedSubject === 'all' && (
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="text-sm font-semibold text-purple-800 mb-2">🌟 Overall Performance</h4>
          <div className="space-y-2 text-sm text-purple-700">
            <p>
              • Total contributions across all subjects: <strong>{userStat.total}</strong> items
            </p>
            <p>
              • Quiz creation activity: <strong>{userStat.quizCount}</strong> questions created
            </p>
            <p>
              • Content enhancement: <strong>{userStat.keywordCount}</strong> keywords added
            </p>
            <p>
              • Quality assurance: <strong>{userStat.reportCount}</strong> reports submitted
            </p>
          </div>
        </div>
      )}

      {/* Contribution Insights */}
      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <h4 className="text-sm font-semibold text-indigo-800 mb-2">💡 Contribution Insights</h4>
        <div className="space-y-2 text-sm text-indigo-700">
          {userStat.quizCount > 0 && (
            <p>• Created <strong>{userStat.quizCount}</strong> quiz question(s) helping other students learn</p>
          )}
          {userStat.keywordCount > 0 && (
            <p>• Contributed <strong>{userStat.keywordCount}</strong> keyword(s) for better searchability</p>
          )}
          {userStat.reportCount > 0 && (
            <p>• Submitted <strong>{userStat.reportCount}</strong> report(s) to improve content quality</p>
          )}
          {userStat.total === 0 && (
            <p className="text-gray-600">
              • No contributions yet {selectedSubject === 'all' ? 'in any subject' : `in ${selectedSubjectObj?.name}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAdditionalInfo;
