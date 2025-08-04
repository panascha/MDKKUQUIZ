import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';
import { Report } from '../../types/api/Report';
import { useState } from 'react';
import ImageGallery from '../magicui/ImageGallery';

interface ReportsTabProps {
    reports: Report[];
    onReview: (id: string, reason: string) => void;
    onDismiss: (id: string, reason: string) => void;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ reports, onReview, onDismiss }) => {
    const [expandedReport, setExpandedReport] = useState<string | null>(null);
    const [reason, setReason] = useState<{[id: string]: string}>({});

    const toggleExpand = (reportId: string) => {
        setExpandedReport(expandedReport === reportId ? null : reportId);
    };

    if (reports.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <p className="text-gray-500 text-center text-sm sm:text-base">No pending reports to review</p>
            </div>
        );
    }
    

    return (
        <div className="space-y-4 sm:space-y-6">
            {reports.map((report) => (
                <Card key={report._id} className="p-4 sm:p-6 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                    {report.type === 'quiz' ? report.originalQuiz?.question : report.originalKeyword?.name}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-orange-100 text-orange-800">
                                    Reported by: {report.User.name}
                                </span>
                                <Button
                                    onClick={() => toggleExpand(report._id)}
                                    className="p-1 hover:bg-gray-100 rounded-full"
                                    textButton={expandedReport === report._id ? "▲" : "▼"}
                                />
                            </div>
                        </div>

                        <p className="text-sm sm:text-base text-gray-600">{report.reason}</p>

                        {expandedReport === report._id && (
                            <div className="mt-2 space-y-4 border-t pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-gray-700">Original Content</h4>
                                        {report.type === 'quiz' ? (
                                            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                                <p>Subject: {report.originalQuiz?.subject?.name}</p>
                                                <p>Category: {report.originalQuiz?.category?.category}</p>
                                                <br />
                                                <p className="font-medium">Question: {report.originalQuiz?.question}</p>
                                                <p className="font-medium mb-1">Answer:</p>
                                                <ul className='list-disc list-inside'>
                                                    {report.originalQuiz?.correctAnswer.map((answer, index) => (
                                                        <li key={index}>
                                                            {answer}
                                                        </li>
                                                    ))}
                                                </ul>

                                                    {
                                                        report.originalQuiz?.choice && report.originalQuiz.choice.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="font-medium mb-1">Choices:</p>
                                                        <ul className="list-disc pl-5 space-y-1">
                                                            {report.originalQuiz.choice.map((choice, index) => (
                                                                <li key={index} className={`text-sm ${report.originalQuiz?.correctAnswer?.includes(choice) ? 'bg-green-100' : ''}`}>
                                                                    {String.fromCharCode(65 + index)}. {choice}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {report.originalQuiz?.img && report.originalQuiz.img.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="font-medium mb-1">Images:</p>
                                                        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2">
                                                            {report.originalQuiz.img.map((img, index) => (
                                                                <div key={index} className="relative aspect-square">
                                                                    <ImageGallery
                                                                        images={[img]}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                                {report.originalKeyword?.isGlobal ? (
                                                    <div className="flex items-center gap-2">
                                                        <p>Type: Global Keyword</p>
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 text-xs rounded">
                                                            Global
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p>Subject: {report.originalKeyword?.subject?.name}</p>
                                                        <p>Category: {report.originalKeyword?.category?.category}</p>
                                                    </>
                                                )}
                                                <br />
                                                <p className="font-medium">Keyword: {report.originalKeyword?.name}</p>
                                                <p className="font-medium">Keywords:</p>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {report.originalKeyword?.keywords?.map((keyword, index) => (
                                                        <li key={index}>{keyword}</li>
                                                    ))}
                                                </ul>

                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium text-gray-700">Suggested Changes</h4>
                                        {report.type === 'quiz' ? (
                                            <div className="bg-yellow-50 p-3 rounded-lg space-y-2">
                                                <p>Subject: {report.suggestedChanges?.subject?.name}</p>
                                                <p>Category: {report.suggestedChanges?.category?.category}</p>
                                                <br />
                                                <p className="font-medium">Question: {report.suggestedChanges?.question}
                                                    {report.suggestedChanges?.question !== report.originalQuiz?.question && (
                                                        <span className="text-red-500 ml-1"> (Modified)</span>
                                                    )}
                                                </p>
                                                <p className="font-medium mb-1">Answer:</p>

    {(() => {
        const originalAnswers = report.originalQuiz?.correctAnswer || [];
        const suggestedAnswers = report.suggestedChanges?.correctAnswer || [];

        const originalAnswerSet = new Set(originalAnswers);
        const suggestedAnswerSet = new Set(suggestedAnswers);

        return (
            <ul className="list-disc pl-5 space-y-1">
                {/* Render suggested answers (marking new ones) */}
                {suggestedAnswers.map((answer, index) => {
                    // Check if this answer is new (wasn't in the original list)
                    const isAdded = !originalAnswerSet.has(answer);

                    return (
                        <li 
                            key={`suggested-${index}`} 
                            className={`text-sm ${isAdded ? 'bg-green-100' : ''}`}
                        >
                            {answer}
                            {isAdded && <span className="text-green-700 font-semibold ml-2">(Added)</span>}
                        </li>
                    );
                })}

                {/* Render original answers that were removed */}
                {originalAnswers.map((answer, index) => {
                    const isRemoved = !suggestedAnswerSet.has(answer);

                    if (isRemoved) {
                        return (
                            <li 
                                key={`original-${index}`} 
                                className="text-sm bg-red-100 line-through"
                            >
                                {answer}
                                <span className="text-red-700 font-semibold ml-2">(Removed)</span>
                            </li>
                        );
                    }
                    return null; // Don't render anything if it wasn't removed
                })}
            </ul>
        );
    })()}
                                                {
                                                    report.suggestedChanges?.choice && report.suggestedChanges.choice.length > 0 && (
                                                        <div className="mt-2">
                                                            <p className="font-medium mb-1">Choices:</p>
    
    {(() => {
        const originalChoices = report.originalQuiz?.choice || [];
        const suggestedChoices = report.suggestedChanges?.choice || [];
        
        const originalChoiceSet = new Set(originalChoices);
        const suggestedChoiceSet = new Set(suggestedChoices);
        
        const correctAnswersSet = new Set(report.suggestedChanges?.correctAnswer || []);

        return (
            <ul className="list-disc pl-5 space-y-1">
                {suggestedChoices.map((choice, index) => {
                    // Determine the status of this choice
                    const isCorrect = correctAnswersSet.has(choice);
                    const isAdded = !originalChoiceSet.has(choice);

                    // Build the className dynamically
                    const classNames = ['text-sm', 'p-1', 'rounded'];
                    if (isCorrect) {
                        classNames.push('bg-green-100'); // Highlight for correct answers
                    }
                    if (isAdded) {
                        classNames.push('border', 'border-blue-400'); // Border for newly added choices
                    }
                    
                    return (
                        <li key={`suggested-choice-${index}`} className={classNames.join(' ')}>
                            {String.fromCharCode(65 + index)}. {choice}
                            {isAdded && <span className="text-blue-700 font-semibold ml-2">(Added)</span>}
                        </li>
                    );
                })}

                {/* Loop 2: Identify and render any choices that were removed */}
                {originalChoices.map((choice, index) => {
                    const isRemoved = !suggestedChoiceSet.has(choice);
                    
                    if (isRemoved) {
                        return (
                            <li 
                                key={`removed-choice-${index}`} 
                                className="text-sm bg-red-100 p-1 rounded line-through"
                            >
                                {choice}
                                <span className="text-red-700 font-semibold ml-2">(Removed)</span>
                            </li>
                        );
                    }
                    return null; // Don't render if it's not removed
                })}
            </ul>
        );
    })()}
                                                        </div>
                                                    )}
                                                {report.suggestedChanges?.img && report.suggestedChanges.img.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="font-medium mb-1">Images:</p>
                                                        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2">
                                                            {report.suggestedChanges.img.map((img, index) => (
                                                                <div key={index} className="relative aspect-square">
                                                                    <ImageGallery
                                                                        images={[img]}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-yellow-50 p-3 rounded-lg space-y-2">
                                                {report.suggestedChangesKeyword?.isGlobal ? (
                                                    <div className="flex items-center gap-2">
                                                        <p>Type: Global Keyword</p>
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 text-xs rounded">
                                                            Global
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p>Subject: {report.suggestedChangesKeyword?.subject?.name}</p>
                                                        <p>Category: {report.suggestedChangesKeyword?.category?.category}</p>
                                                    </>
                                                )}
                                                <br />
                                                <p className="font-medium">Keyword: {report.suggestedChangesKeyword?.name}
                                                    {report.suggestedChangesKeyword?.name !== report.originalKeyword?.name && (
                                                    <span className="text-red-500 ml-1"> (Modified)</span>
                                                )}
                                                </p>
                                                <p className="font-medium mb-1">Keywords:</p>

    {(() => {
        const originalKeywords = report.originalKeyword?.keywords || [];
        const suggestedKeywords = report.suggestedChangesKeyword?.keywords || [];

        // Create Sets for fast, order-independent lookups
        const originalKeywordSet = new Set(originalKeywords);
        const suggestedKeywordSet = new Set(suggestedKeywords);

        // --- Step 2: Render the lists to show the differences ---
        return (
            <ul className="list-disc pl-5 space-y-1">
                {/* Loop 1: Render the suggested keywords, highlighting new ones */}
                {suggestedKeywords.map((keyword, index) => {
                    const isAdded = !originalKeywordSet.has(keyword);

                    return (
                        <li 
                            key={`suggested-kw-${index}`} 
                            className={`text-sm p-1 rounded ${isAdded ? 'bg-green-100' : ''}`}
                        >
                            {keyword}
                            {isAdded && <span className="text-green-700 font-semibold ml-2">(Added)</span>}
                        </li>
                    );
                })}

                {originalKeywords.map((keyword, index) => {
                    const isRemoved = !suggestedKeywordSet.has(keyword);

                    if (isRemoved) {
                        return (
                            <li 
                                key={`removed-kw-${index}`} 
                                className="text-sm bg-red-100 p-1 rounded line-through"
                            >
                                {keyword}
                                <span className="text-red-700 font-semibold ml-2">(Removed)</span>
                            </li>
                        );
                    }
                    return null; // Essential: Don't render anything if it wasn't removed
                })}
            </ul>
        );
    })()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <h4 className="font-medium text-gray-700 mb-2">Report Details</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Report Type:</span> {report.type}</p>
                                        <p><span className="font-medium">Reported At:</span> {new Date(report.createdAt).toLocaleString()}</p>
                                        <p><span className="font-medium">Reason:</span> {report.reason}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
                                    {expandedReport === report._id && (
                                        <div className="mb-2 w-full">
                                            <label className="block text-sm font-semibold mb-1">Reason</label>
                                            <textarea
                                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                                placeholder="Enter reason"
                                                value={reason[report._id] || ''}
                                                onChange={e => setReason(r => ({ ...r, [report._id]: e.target.value }))}
                                                rows={2}
                                            />
                                        </div>
                                    )}
                                    <Button
                                        onClick={() => onReview(report._id, reason[report._id] || '')}
                                        className="flex-1 sm:flex-none bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                        textButton="Review"
                                    />
                                    <Button
                                        onClick={() => onDismiss(report._id, reason[report._id] || '')}
                                        className="flex-1 sm:flex-none bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                        textButton="Dismiss"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default ReportsTab; 