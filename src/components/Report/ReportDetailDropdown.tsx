import React from 'react';
import { Report } from '../../types/api/Report';
import ImageGallery from '../magicui/ImageGallery';

interface ReportDetailDropdownProps {
  report: Report;
  open: boolean;
}

const ReportDetailDropdown: React.FC<ReportDetailDropdownProps> = ({ report, open }) => {
  if (!open) return null;

  const QuizDetails = ({ quiz, title }: { quiz: any, title: string }) => (
    <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h4 className="font-bold text-base mb-2 text-gray-900 border-b pb-1">{title}</h4>
      <div className="grid grid-cols-1 gap-x-8 gap-y-2">
        <div><span className="font-semibold">Question:</span> {quiz?.question}</div>
        {['choice', 'both'].includes(quiz?.type) && (
            <div>
            <span className="font-semibold">Choices:</span>
            <ul className="list-disc list-inside">
              {quiz?.choice?.map((choice: string, index: number) => (
              <li key={index}>{choice}</li>
              ))}
            </ul>
            </div>

        )}
        <div><span className="font-semibold">Answer:</span> {quiz?.correctAnswer?.join(', ')}</div>
        <div><span className="font-semibold">Subject:</span> {quiz?.subject?.name}</div>
        <div><span className="font-semibold">Category:</span> {quiz?.category?.category}</div>
        <div><span className="font-semibold">Status:</span> {quiz?.status}</div>
      </div>
      {Array.isArray(quiz?.img) && quiz.img.length > 0 && (
        <div className="mt-4">
          <span className="font-semibold block mb-1">Images:</span>
          <ImageGallery images={quiz.img} />
        </div>
      )}
    </div>
  );

  const KeywordDetails = ({ keyword, title }: { keyword: any, title: string }) => (
    <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h4 className="font-bold text-base mb-2 text-gray-900 border-b pb-1">{title}</h4>
      <div className="grid grid-cols-1 gap-x-8 gap-y-2">
        <div><span className="font-semibold">Name:</span> {keyword?.name}</div>
        <div><span className="font-semibold">Subject:</span> {keyword?.subject?.name}</div>
        <div><span className="font-semibold">Category:</span> {keyword?.category?.category}</div>
        <div><span className="font-semibold">Status:</span> {keyword?.status}</div>
        <div>
          <span className="font-semibold">Keywords:</span>
          <ul className="list-disc list-inside">
            {keyword?.keywords?.map((keyword: string, index: number) => (
              <li key={index}>{keyword}</li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );

  return (
    <div
      className={`w-full mt-3 bg-gray-50 border border-gray-200 rounded-lg shadow-inner text-sm text-gray-800 overflow-hidden transition-all duration-300 ${open ? 'max-h-[1000px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-2 pointer-events-none'}`}
      style={{ transitionProperty: 'max-height, opacity, transform' }}
    >
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-bold text-base mb-2 text-gray-900">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div><span className="font-semibold">Reason:</span> {report.reason || 'No reason provided'}</div>
            <div><span className="font-semibold">Type:</span> {report.type}</div>
            <div><span className="font-semibold">Status:</span> {report.status}</div>
            <div><span className="font-semibold">Created At:</span> {new Date(report.createdAt).toLocaleString()}</div>
            <div><span className="font-semibold">Reported By:</span> {report.User?.name || 'Unknown'}</div>
          </div>
        </div>
        {report.type === 'quiz' && (
          <div className="flex justify-center w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto max-w-4xl w-full">
              <QuizDetails quiz={report.originalQuiz} title="Original" />
              {report.suggestedChanges ? (
                <QuizDetails quiz={report.suggestedChanges} title="Suggested Change" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic border border-dashed border-gray-300 rounded-lg bg-white p-3">No suggested change</div>
              )}
            </div>
          </div>
        )}
        {report.type === 'keyword' && (
          <div className="flex justify-center w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto max-w-4xl w-full">
              <KeywordDetails keyword={report.originalKeyword} title="Original" />
              {report.suggestedChangesKeyword ? (
                <KeywordDetails keyword={report.suggestedChangesKeyword} title="Suggested Change" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic border border-dashed border-gray-300 rounded-lg bg-white p-3">No suggested change</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailDropdown; 