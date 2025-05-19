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


const QuestionDetail = () => {
    const router = useRouter();
    const params = useParams();
    const questionID = params.questionID;
    const subjectID = params.subjectID;

    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [question, setQuestion] = useState<Quiz | null>(null);
    const [subject, setSubject] = useState<Subject | null>(null);
    const [category, setCategory] = useState<Category | null>(null);

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

// Fetch subject name and category name
useEffect(() => {
    if (!question?.category || !question?.subject || !session?.user.token) {
        return;
    }
    const fetchSubjectAndCategory = async () => {
        try {
            setIsLoading(true);
            const subjectResponse = await fetch(
                BackendRoutes.SUBJECT_BY_ID.replace(
                    ":subjectID",
                    typeof question.subject === "string"
                        ? question.subject
                        : ""
                ),
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.user.token}`,
                    },
                }
            );

            if (!subjectResponse.ok) {
                throw new Error("Failed to fetch subject");
            }

            const subjectData = await subjectResponse.json();
            setSubject(subjectData.data);
            console.log("Subject data:", subjectData.data);

            const categoryID =
                typeof question.category === "string"
                    ? question.category
                    : "";
            if (!categoryID) {
                throw new Error("Invalid category ID");
            }
            const categoryResponse = await fetch(
                BackendRoutes.CATEGORY_BY_ID.replace(":categoryID", categoryID),
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.user.token}`,
                    },
                }
            );

            if (!categoryResponse.ok) {
                throw new Error("Failed to fetch category");
            }

            const categoryData = await categoryResponse.json();
            setCategory(categoryData.data);
            console.log("Category data:", categoryData.data);
        } catch (error) {
            setError(`${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    fetchSubjectAndCategory();
}, [question, session?.user.token]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-3 pt-10">
              <LoaderIcon /> Loading...
            </div>
          );          
    }
    
    if (error) {
        return (
            <div className="text-red-500 flex items-center gap-2 pt-4">
              <span>Error:</span> {error}
            </div>
          );          
    }

    if (!question) {
        return (
            <div className="text-red-500 pt-4">Questions not found</div>
          );          
    }

    // sample images for the image gallery
    const images = ['/mdkkuview.jpg', '/mdkkulogo.png'];

    return (
        <ProtectedPage>
        <div className="flex flex-col items-center justify-center p-4 mt-20">
            <div className="absolute top-23 md:top-25 left-8 md:left-15 text-lg">
                <Link href={`${FrontendRoutes.HOMEPAGE}/${subjectID}/question`}>
                    <button className="flex items-center mb-4 hover:bg-orange-400 hover:text-white p-2 rounded-sm transition duration-300 ease-in-out hover:opacity-80 cursor-pointer">
                        <span className='flex items-center'> <IoIosArrowBack className="text-xl" /> Back</span>
                    </button>
                </Link>
            </div>
            <h1 className="text-2xl font-bold">Question Detail</h1>
            <Card className="mt-6 p-5 bg-white shadow-md rounded-lg relative w-full max-w-3xl gap-2">
                <p className="mt-2 text-base md:text-lg">Subject: {subject?.name}</p>
                <p className="mt-2 text-base md:text-lg">Category: {category?.category}</p>
                {/* <p className="mt-2">Created by: {question.user}</p> */}
                {/* <p className="mt-2">Last updated: {new Date(question.updatedAt).toLocaleDateString()}</p> */}
                <button
                    className="absolute cursor-pointer bottom-3 right-3 bg-orange-500 hover:bg-orange-600 text-white px-2 md:px-3 py-2 rounded shadow transition"
                    onClick={() => alert('Report functionality coming soon!')}
                >
                    Report
                </button>
            </Card>
                <Card className="mt-4 p-4 bg-white shadow-md rounded-lg shadow-lg border-1 border-gray-200 w-6/10 flex-col md:flex-row md:space-x-6">
                    {/* Question text */}
                    <div className="md:w-1/2 flex flex-col justify-start">
                        <span className="text-base md:text-lg">Question: {question.question}</span>
                        {/* Images */}
                        {question.img && question.img.length > 0 && (
                            <div className="flex flex-col items-center space-y-2 mt-4">
                                <span className="text-base md:text-lg self-start">Image:</span>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <ImageGallery images={Array.isArray(question.img) ? question.img : [question.img]} />
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Choices and Answers */}
                    <div className="md:w-1/2 flex flex-col justify-start mt-4 md:mt-0">
                        {question.choice && question.choice.length > 0 && (
                            <div className="flex flex-col items-start">
                                <span className="text-base md:text-lg">Choices:</span>
                                <ul className="list-disc list-inside ml-4">
                                    {question.choice.map((choice: string, idx: number) => (
                                        <li key={idx} className="text-base md:text-lg">
                                            {choice}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="mt-4 flex flex-col items-start">
                            <span className="text-base md:text-lg">
                                Correct Answer{question.correctAnswer.length > 1 ? 's' : ''}:
                            </span>
                            <ul className="list-disc list-inside ml-4">
                                {question.correctAnswer.map((ans: string, idx: number) => (
                                    <li key={idx} className="text-base md:text-lg">
                                        {ans}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Card>

        </div>
        </ProtectedPage>
    )
}

export default QuestionDetail;