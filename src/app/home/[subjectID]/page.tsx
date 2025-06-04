"use client"
import React from 'react';
import Link from 'next/link';
import { IoIosArrowBack } from "react-icons/io";
import { useParams } from "next/navigation";
import { useSession } from 'next-auth/react';
import { Subject } from '@/types/api/Subject';
import { LoaderIcon } from 'react-hot-toast';
import axios from 'axios';
import { BackendRoutes, FrontendRoutes } from '@/config/apiRoutes';
import Image from 'next/image';
import ProtectedPage from '@/components/ProtectPage';
import { useRouter } from "next/navigation";
import { useGetSubjectByID } from '@/hooks/subject/useGetSubjectByID';
import { useQuery } from '@tanstack/react-query';
import { Category } from '@/types/api/Category';

const SubjectDetail = () => {
    const router = useRouter();
    const params = useParams();
    const subjectID = params.subjectID as string;
    const {
        data: subject,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ["subject", subjectID],
        queryFn: () => useGetSubjectByID(subjectID),
        enabled: !!subjectID
    });
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-3 pt-10">
              <LoaderIcon /> Loading...
            </div>
          );          
    }
    
    if (isError) {
        return (
            <div className="text-red-500 flex items-center gap-2 pt-4">
              <span>Error:</span> {error?.message}
            </div>
          );          
    }
    
    if (!subject) {
        return (
            <div className="text-red-500 pt-4">Subject not found</div>
          );          
    }

    return (
        <ProtectedPage>
            <div className="container mx-auto p-4 pt-20 mt-10">
                <div className="absolute top-23 md:top-25 left-8 md:left-15 text-lg">
                    <button onClick={() => router.push(FrontendRoutes.HOMEPAGE)} className="flex items-center mb-4 hover:bg-orange-400 hover:text-white p-2 rounded-sm transition duration-300 ease-in-out hover:opacity-80 cursor-pointer">
                        <span className='flex items-center'> <IoIosArrowBack className="text-xl" /> Back</span>
                    </button>
                </div>
                <div className="text-center mt-6">
                    <h1 className="text-4xl font-extrabold mb-6">{subject.name}</h1>

                    <div
                        className="w-48 h-48 md:w-64 md:h-64 relative mx-auto rounded-full shadow-lg hover:scale-105 transition-transform duration-300 overflow-hidden cursor-pointer">
                        <Image
                        src={`http://localhost:5000${subject.img}`}
                        alt={subject.name}
                        fill
                        className="object-cover rounded-full"
                        />
                    </div>

                    <p className="text-lg text-gray-600 mt-4">{subject.description}</p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center mt-8 gap-4 sm:gap-6">
                    <Link
                        href={`${subjectID}/quiz`}
                        className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out text-center"
                    >
                        Take Quiz
                    </Link>
                    <Link
                        href={`${subjectID}/question`}
                        className="cursor-pointer px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out text-center"
                    >
                        Explore Question
                    </Link>
                    <Link
                        href={`${subjectID}/keyword`}
                        className="cursor-pointer px-6 py-3 bg-yellow-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-yellow-700 transition duration-300 ease-in-out text-center"
                    >
                        Explore Keyword
                    </Link>
                </div>
                <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-4">Topics Covered</h2>
                    <ul className="space-y-3">
                        {subject.Category?.map((category: Category) => (
                            <li key={category._id} className="text-lg text-gray-700">
                                <strong className="font-semibold">{category.category}:</strong> {category.description}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </ProtectedPage>
    );
};

export default SubjectDetail;