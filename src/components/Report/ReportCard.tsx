"use client";

import React, { useState } from 'react';
import { Report } from '../../types/api/Report';
import { Badge } from '../ui/Badge';
import ImageGallery from '../magicui/ImageGallery';
import { 
    ChevronDown, 
    ChevronUp, 
    AlertCircle, 
    CheckCircle2, 
    XCircle, 
    ArrowRight, 
    MessageSquareWarning,
    ImageIcon
} from 'lucide-react';

interface ReportCardProps {
    report: Report;
}

export default function ReportCard({ report }: ReportCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case 'rejected': return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 overflow-hidden">
            {/* --- Header Section (Preview Info) --- */}
            <div 
                className="p-5 cursor-pointer flex flex-col sm:flex-row gap-4 justify-between items-start bg-white"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex flex-col gap-3 w-full pr-2">
                    {/* Meta Info Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge className={`px-3 py-1 flex items-center gap-1.5 ${getStatusStyle(report.status)}`}>
                            {getStatusIcon(report.status)}
                            <span className="capitalize font-semibold">{report.status}</span>
                        </Badge>
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide 
                            ${report.type === 'quiz' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {report.type}
                        </span>
                        <span className="text-sm text-gray-400">
                            {new Date(report.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'short', day: 'numeric'
                            })}
                        </span>
                    </div>

                    {/* Content Preview (Diff) */}
                    <div className="mt-1">
                        {report.type === 'quiz' 
                            ? <QuizPreview report={report} /> 
                            : <KeywordPreview report={report} />
                        }
                    </div>
                </div>

                {/* Expand Button */}
                <button className="text-gray-400 hover:text-blue-600 transition-colors self-start sm:self-center mt-2 sm:mt-0 p-1">
                    {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                </button>
            </div>

            {/* --- Expanded Content Section (Dropdown) --- */}
            {isExpanded && (
                <div className="border-t border-gray-100 p-5 bg-gray-50/30">
                    
                    {/* Reason Box */}
                    <div className="mb-6 bg-orange-50 p-4 rounded-lg border border-orange-100 flex gap-3 items-start">
                        <MessageSquareWarning className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-orange-800 mb-1">Reported Reason</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{report.reason}</p>
                        </div>
                    </div>

                    {/* Full Detail View (Side-by-Side) */}
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Full Details & Media</h4>
                    {report.type === 'quiz' ? (
                        <QuizFullView report={report} />
                    ) : (
                        <KeywordFullView report={report} />
                    )}
                </div>
            )}
        </div>
    );
}

// ==========================================
// PREVIEW COMPONENTS (Shown in Card Header)
// ==========================================

const QuizPreview = ({ report }: { report: Report }) => {
    const original = report.originalQuiz;
    const suggested = report.suggestedChanges;

    if (!original || !suggested) return <span className="text-red-400 text-sm italic">Data unavailable</span>;

    const isQuestionChanged = original.question !== suggested.question;
    const isAnswerChanged = JSON.stringify(original.correctAnswer) !== JSON.stringify(suggested.correctAnswer);
    const hasImages = (original.img && original.img.length > 0) || (suggested.img && suggested.img.length > 0);

    return (
        <div className="space-y-3">
            {/* Question Text Diff */}
            <div>
                {isQuestionChanged ? (
                    <div className="grid gap-2">
                        <div className="bg-red-50 text-red-800 p-2.5 rounded-md text-sm border border-red-100 flex gap-2 items-start">
                            <span className="bg-red-200 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5">ORIGINAL</span>
                            <span className="line-through opacity-70 leading-snug">{original.question}</span>
                        </div>
                        <div className="bg-green-50 text-green-800 p-2.5 rounded-md text-sm border border-green-100 flex gap-2 items-start">
                            <span className="bg-green-200 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5">SUGGESTED</span>
                            <span className="font-medium leading-snug">{suggested.question}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-800 font-semibold text-lg leading-snug">{original.question}</p>
                )}
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap gap-2">
                {/* Answer Change Badge */}
                {isAnswerChanged && (
                    <div className="inline-flex items-center gap-2 text-xs bg-yellow-50 px-2 py-1.5 rounded border border-yellow-200 text-yellow-800">
                        <span className="font-bold">Answer Update:</span>
                        <span className="line-through opacity-60">{original.correctAnswer.join(', ')}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="font-bold bg-white px-1 rounded shadow-sm">{suggested.correctAnswer.join(', ')}</span>
                    </div>
                )}

                {/* Image Badge */}
                {hasImages && (
                    <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 px-2 py-1.5 rounded border border-blue-200 text-blue-700 font-medium">
                        <ImageIcon className="w-3 h-3" />
                        Images Attached
                    </span>
                )}
            </div>
        </div>
    );
};

const KeywordPreview = ({ report }: { report: Report }) => {
    const original = report.originalKeyword;
    const suggested = report.suggestedChangesKeyword;

    if (!original || !suggested) return <span className="text-red-400 text-sm italic">Data unavailable</span>;

    const isNameChanged = original.name !== suggested.name;

    return (
        <div className="space-y-3">
            {/* Name Diff */}
            {isNameChanged ? (
                <div className="flex items-center gap-2 text-lg font-bold flex-wrap">
                    <span className="text-red-400 line-through decoration-2 decoration-red-400">{original.name}</span>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                    <span className="text-green-600">{suggested.name}</span>
                </div>
            ) : (
                <h3 className="text-lg font-bold text-gray-800">{original.name}</h3>
            )}

            {/* Keywords Diff Chips */}
            <div className="flex flex-wrap gap-2">
                {/* 1. New Keywords (Green) */}
                {suggested.keywords.map((k, i) => {
                    if (!original.keywords.includes(k)) {
                        return (
                            <span key={`new-${i}`} className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold border border-green-200 flex items-center gap-1">
                                + {k}
                            </span>
                        );
                    }
                    return null;
                })}

                {/* 2. Removed Keywords (Red) */}
                {original.keywords.map((k, i) => {
                    if (!suggested.keywords.includes(k)) {
                        return (
                            <span key={`del-${i}`} className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs border border-red-200 line-through opacity-70">
                                {k}
                            </span>
                        );
                    }
                    return null;
                })}

                {/* 3. Unchanged (Gray - Show limited amount to save space) */}
                {original.keywords.filter(k => suggested.keywords.includes(k)).slice(0, 3).map((k, i) => (
                    <span key={`keep-${i}`} className="px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs border border-gray-200">
                        {k}
                    </span>
                ))}
                {original.keywords.filter(k => suggested.keywords.includes(k)).length > 3 && (
                    <span className="px-2 py-1 text-xs text-gray-400">...</span>
                )}
            </div>
        </div>
    );
};

// ==========================================
// FULL DETAIL COMPONENTS (Shown in Dropdown)
// ==========================================

const QuizFullView = ({ report }: { report: Report }) => {
    const original = report.originalQuiz;
    const suggested = report.suggestedChanges;

    if (!original || !suggested) return null;

    const showChoices = original.type !== 'written' && suggested.type !== 'written';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Column */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    <h4 className="font-bold text-gray-500">Original</h4>
                </div>
                
                {/* Images */}
                {original.img && original.img.length > 0 && (
                    <div className="mb-2">
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <ImageGallery images={original.img} className="object-contain w-full h-full" />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Question</p>
                        <p className="text-gray-800 text-sm">{original.question}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Correct Answer</p>
                        <div className="flex flex-wrap gap-1">
                            {original.correctAnswer.map((ans, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">{ans}</span>
                            ))}
                        </div>
                    </div>
                    {showChoices && original.choice && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Choices</p>
                            <ul className="space-y-1">
                                {original.choice.map((c, i) => (
                                    <li key={i} className="text-xs text-gray-600 flex gap-2">
                                        <span className="font-mono text-gray-400">{String.fromCharCode(65 + i)}.</span>
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Suggested Column */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <h4 className="font-bold text-blue-600">Suggested</h4>
                </div>

                {/* Images */}
                {suggested.img && suggested.img.length > 0 && (
                    <div className="mb-2">
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <ImageGallery images={suggested.img} className="object-contain w-full h-full" />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm space-y-3">
                    <div>
                        <p className="text-xs font-semibold text-blue-400 uppercase mb-1">Question</p>
                        <p className="text-gray-800 text-sm">{suggested.question}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-blue-400 uppercase mb-1">Correct Answer</p>
                        <div className="flex flex-wrap gap-1">
                            {suggested.correctAnswer.map((ans, i) => (
                                <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs border border-green-200 font-medium">{ans}</span>
                            ))}
                        </div>
                    </div>
                    {showChoices && suggested.choice && (
                        <div>
                            <p className="text-xs font-semibold text-blue-400 uppercase mb-1">Choices</p>
                            <ul className="space-y-1">
                                {suggested.choice.map((c, i) => (
                                    <li key={i} className="text-xs text-gray-600 flex gap-2">
                                        <span className="font-mono text-gray-400">{String.fromCharCode(65 + i)}.</span>
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const KeywordFullView = ({ report }: { report: Report }) => {
    // Reusing the Preview Logic but laid out fully if needed, 
    // but since Keyword diff is text-only, the preview usually covers it well.
    // We display it side-by-side here for consistency.
    const original = report.originalKeyword;
    const suggested = report.suggestedChangesKeyword;

    if (!original || !suggested) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <h4 className="font-bold text-gray-500 border-b pb-2 text-sm">Original</h4>
                <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="font-bold text-gray-700 mb-2">{original.name}</p>
                    <div className="flex flex-wrap gap-1">
                        {original.keywords.map((k, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{k}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <h4 className="font-bold text-blue-600 border-b pb-2 text-sm">Suggested</h4>
                <div className="bg-white p-3 rounded border border-blue-100">
                    <p className="font-bold text-blue-800 mb-2">{suggested.name}</p>
                    <div className="flex flex-wrap gap-1">
                        {suggested.keywords.map((k, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{k}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};