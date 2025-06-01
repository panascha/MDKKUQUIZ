"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FrontendRoutes,BackendRoutes } from '@/config/apiRoutes';
import { useSession } from 'next-auth/react';
import ProtectedPage from '@/components/ProtectPage';
import { Keyword } from '@/types/api/Keyword';
import { Quiz } from '@/types/api/Quiz';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { IoIosArrowBack } from "react-icons/io";

const KeywordDetail = () => {
    // const router = useRouter();
    const params = useParams();
    const subjectID = params.subjectID;
    const keywordID = params.keywordID;

    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [keyword, setKeyword] = useState<Quiz | null>(null);

    useEffect(() => {
        const fetchKeyword = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(
                    // แก้ BackendRoutes.KEYWORD_BY_ID.replace(":keywordID", String(keywordID)),
                    BackendRoutes.QUIZ_BY_ID.replace(":questionID", String(keywordID)),
                    {
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
                setKeyword(data.data);
                console.log("Keyword data:", data.data);
            } catch (error) {
                setError(`${error}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchKeyword();
    }, [keywordID, session?.user.token]);


    if (isLoading) {
        return <p>Loading...</p>;
    }
    if (error) {
        return <p>Error: {error}</p>;
    }
    return (
        <ProtectedPage>
            <div className="mx-auto p-4 mt-20 justify-center items-center flex flex-col">
            <div className="absolute top-23 md:top-25 left-8 md:left-15 text-lg">
            <Link href={`${FrontendRoutes.HOMEPAGE}/${subjectID}/keyword`}>
                <button className="flex items-center mb-4 hover:bg-orange-400 hover:text-white p-2 rounded-sm transition duration-300 ease-in-out hover:opacity-80 cursor-pointer">
                <span className='flex items-center'> <IoIosArrowBack className="text-xl" /> Back</span>
                </button>
            </Link>
            </div>
                <h1 className="text-2xl font-bold mb-4">Keyword Detail</h1>
            <Card className="mt-6 p-5 bg-white shadow-md rounded-lg relative w-full max-w-3xl gap-2">
            <p className="mt-2 text-base md:text-lg">Subject: {keyword?.subject?.name}</p>
                    <p className="mt-2 text-base md:text-lg">Category: {keyword?.category?.category}</p>
            <button
                className="absolute cursor-pointer bottom-3 right-3 bg-orange-500 hover:bg-orange-600 text-white px-2 md:px-3 py-2 rounded shadow transition"
                onClick={() => alert('Report functionality coming soon!')}
            >
                Report
            </button>
                </Card>
                <Card className="mt-6 p-5 bg-white shadow-md rounded-lg relative w-full max-w-3xl gap-2">
                    <p className=" text-base md:text-lg">Name: {keyword?.question}</p>
                    <p className="text-base md:text-lg">Keywords: </p>
                    {keyword?.choice?.map((choice, index) => (
                        <span key={index} className="text-base"> {index + 1}: {choice}</span>
                    ))}
                    
                    <Badge
                        className={`absolute top-5 right-5 transition-colors duration-300 ${
                            keyword?.approved
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                    >
                        {keyword?.approved ? "Approved" : "Pending"}
                    </Badge>
                </Card>
        </div>
        </ProtectedPage>
    );
};

export default KeywordDetail;
