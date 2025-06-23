"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import { Quiz } from "@/types/api/Quiz";
import { Subject } from "@/types/api/Subject";
import { Category } from "@/types/api/Category";
import { BackendRoutes, FrontendRoutes } from "@/config/apiRoutes";
import { IoIosArrowBack } from "react-icons/io";
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import ImageGallery from '@/components/magicui/ImageGallery';
import { LoaderIcon } from 'react-hot-toast';
import ProtectedPage from '@/components/ProtectPage';
import AddReportModal from '@/components/Report/AddQuizReportModal';
import { useUser } from '@/hooks/useUser';
import { Badge } from '@/components/ui/Badge';
import { Role_type } from '@/config/role';
import AddQuizReportModal from '@/components/Report/AddQuizReportModal';

const QuestionDetail = () => {
    const params = useParams();
    const questionID = params.questionID;
    const { data: session } = useSession();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [question, setQuestion] = useState<Quiz | null>(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const isAdmin = user?.role === Role_type.ADMIN || user?.role === Role_type.SADMIN;
    // Fetch question details
    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(
                    BackendRoutes.QUIZ_BY_ID.replace(":questionID", typeof questionID === "string" ? questionID : Array.isArray(questionID) ? questionID[0] : ""),
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${session?.user.token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch question");
                }

                const data = await response.json();
                setQuestion(data.data);
                console.log("Question data:", data.data);
            } catch (error) {
                setError(`${error}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (questionID && session?.user.token) {
            fetchQuestion();
        }
    }, [questionID, session?.user.token]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-3 text-lg text-gray-600">
                    <LoaderIcon className="animate-spin" /> Loading...
                </div>
            </div>
        );          
    }
    
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500 flex items-center gap-2 p-4 bg-red-50 rounded-lg">
                    <span className="font-semibold">Error:</span> {error}
                </div>
            </div>
        );          
    }

    if (!question) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500 p-4 bg-red-50 rounded-lg">Questions not found</div>
            </div>
        );          
    }

    // sample images for the image gallery
    // const images = ['/mdkkuview.jpg', '/mdkkulogo.png'];

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link href={FrontendRoutes.QUESTION}>
                            <button className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors duration-200">
                                <IoIosArrowBack className="text-xl" />
                                <span>Back to Questions</span>
                            </button>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Detail</h1>
                        <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full"></div>
                    </div>

                    {/* Question Info Card */}
                    <Card className="bg-white shadow-lg rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Question Information</h2>
                            {isAdmin && (
                                <Badge
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                                        question.status === "approved"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                        : question.status === "pending"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                                        : question.status === "reported"
                                        ? "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                                        : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                                    }`}
                                >
                                    {question.status === "approved" 
                                        ? "Approved" 
                                        : question.status === "pending"
                                        ? "Pending"
                                        : question.status === "reported"
                                        ? "Reported"
                                        : "Rejected"}
                                </Badge>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Subject</p>
                                <p className="font-semibold text-gray-900">{question.subject.name}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Category</p>
                                <p className="font-semibold text-gray-900">{question.category.category}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Question Type</p>
                                <p className="font-semibold text-gray-900">
                                    {question.type === "choice"
                                        ? "MCQ"
                                        : question.type === "written"
                                        ? "Short Answer"
                                        : question.type === "both"
                                        ? (
                                            <span className="inline-block px-3 py-1 rounded-full border border-blue-400 bg-blue-50 text-blue-700 font-bold shadow-sm animate-pulse">
                                                MCQ + Short Answer
                                            </span>
                                        )
                                        : "Unknown"}
                                </p>
                            </div>
                        </div>
                        {question.status === 'approved' && (
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="mt-4 w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                Report Question
                            </button>
                        )}
                    </Card>

                    {/* Question Content Card */}
                    <Card className="bg-white shadow-lg rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column - Question and Images */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Question</h2>
                                    <p className="text-gray-700 leading-relaxed">{question.question}</p>
                                </div>
                                
                                {question.img && question.img.length > 0 && (
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Images</h2>
                                        <div className="flex justify-center">
                                            <ImageGallery 
                                                images={Array.isArray(question.img) 
                                                    ? question.img.map(img => `http://localhost:5000${img}`) 
                                                    : [`http://localhost:5000${question.img}`]} 
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Choices and Answers */}
                            <div className="space-y-6">
                                {(question.type === 'choice' || question.type === 'both') && (
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Choices (MCQ)</h2>
                                        {question.choice && question.choice.length > 0 ? (
                                            <ul className="space-y-2">
                                                {question.choice.map((choice: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="text-orange-500 font-semibold">{String.fromCharCode(65 + idx)}.</span>
                                                        <span className="text-gray-700">{choice}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-400 italic">No choices provided.</p>
                                        )}
                                    </div>
                                )}

                                {(question.type === 'written' || question.type === 'both') && (
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Correct Answers (Short Answer)</h2>
                                        {question.correctAnswer && question.correctAnswer.length > 0 ? (
                                            <ul className="space-y-2">
                                                {question.correctAnswer.map((ans: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="text-green-500 font-semibold">✓</span>
                                                        <span className="text-gray-700">{ans}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-400 italic">No short answers provided.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Report Modal */}
            <AddQuizReportModal
                showModal={showReportModal}
                setShowModal={setShowReportModal}
                originalQuiz={question}
                userProp={user}
            />
        </ProtectedPage>
    )
}

export default QuestionDetail;