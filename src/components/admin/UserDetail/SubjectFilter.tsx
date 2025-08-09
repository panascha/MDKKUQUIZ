"use client";

import React from 'react';
import type { Subject } from '../../../types/api/Subject';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/DropdownMenu';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { LoaderIcon } from 'lucide-react';
import Image from 'next/image';
import { BACKEND_URL } from '../../../config/apiRoutes';

interface Props {
  subjects: Subject[];
  selectedSubject: string;
  isLoading: boolean;
  onChange: (id: string) => void;
}

const SubjectFilter: React.FC<Props> = ({ subjects, selectedSubject, isLoading, onChange }) => {
  const selectedSubjectObj = subjects.find(s => s._id === selectedSubject);

  return (
    <div className="mt-4 sm:mt-0">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Subject
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger className="min-w-[200px] text-left hover:bg-gray-200 border border-gray-300 rounded-md p-2 transition duration-300 ease-in-out cursor-pointer">
          {isLoading ? (
            <span className="flex items-center">
              <LoaderIcon className="animate-spin h-4 w-4 mr-2" />
              Loading...
            </span>
          ) : selectedSubject === 'all' ? (
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-gray-600" />
              <span>All Subjects</span>
            </div>
          ) : selectedSubjectObj ? (
            <div className="flex items-center">
              {selectedSubjectObj.img && (
                <div className="relative w-6 h-6 mr-2">
                  <Image
                    src={`${BACKEND_URL}${selectedSubjectObj.img}`}
                    alt={selectedSubjectObj.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <span>{selectedSubjectObj.name}</span>
            </div>
          ) : (
            'Select Subject'
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 bg-white max-h-60 overflow-y-auto">
          {/* All Subjects Option */}
          <DropdownMenuItem
            className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
            onClick={() => onChange('all')}
          >
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-3 text-gray-600" />
              <div>
                <div className="font-medium">All Subjects</div>
                <div className="text-sm text-gray-500">Combined statistics</div>
              </div>
            </div>
          </DropdownMenuItem>
          
          {/* Individual Subjects */}
          {subjects.map((subject) => (
            <DropdownMenuItem
              key={subject._id}
              className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
              onClick={() => onChange(subject._id)}
            >
              <div className="flex items-center">
                {subject.img && (
                  <div className="relative w-6 h-6 mr-3">
                    <Image
                      src={`${BACKEND_URL}${subject.img}`}
                      alt={subject.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div>
                  <div className="font-medium">{subject.name}</div>
                  <div className="text-sm text-gray-500">Year {subject.year}</div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SubjectFilter;
