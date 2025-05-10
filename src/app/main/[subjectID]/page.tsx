"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { IoIosArrowBack } from "react-icons/io";
import { useParams } from "next/navigation";
import { useSession } from 'next-auth/react';
import { Subject } from '@/types/api/Subject';
import { LoaderIcon } from 'react-hot-toast';
import axios from 'axios';
import { BackendRoutes } from '@/config/apiRoutes';
import Image from 'next/image';
import ProtectedPage from '@/components/ProtectPage';
import Navbar from '@/components/Navbar';


const SubjectDetail = () => {
    const [subject, setSubject] = useState<Subject | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    const params = useParams();
    const subjectID = params.subjectID;
  
    const { data: session } = useSession();

    useEffect(() => {
        if (!subjectID) return;
    
        const fetchSubject = async () => {
          try {
            setIsLoading(true);
            const response = await axios.get(`${BackendRoutes.SUBJECT}/${subjectID}`);
            setSubject(response.data.data);
            setIsLoading(false);
          } catch (err) {
            setError("Failed to fetch subject details.");
            setIsLoading(false);
          }
        };
    
        fetchSubject();
    }, [subjectID]);
    
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
    
    if (!subject) {
        return (
            <div className="text-red-500 pt-4">Subject not found</div>
          );          
    }
    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
        const image = e.target as HTMLImageElement;  // Type the target as an HTMLImageElement
        image.classList.add('shake');
        setTimeout(() => {
            image.classList.remove('shake');
        }, 500); // Duration of the shake animation
    };    

    return (
        <ProtectedPage>
            <div className="container mx-auto p-4 pt-20 mt-10">
                <Link
                    href="/main"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out w-[40%] md:w-[30%] lg:w-[15%]"
                >
                    <IoIosArrowBack className="text-xl" />
                    <span className="text-lg font-medium">Back to Subjects</span>
                </Link>
                <div className="text-center mt-6">
                    <h1 className="text-4xl font-extrabold mb-6">{subject.name}</h1>

                    <div
                        className="w-48 h-48 md:w-64 md:h-64 relative mx-auto rounded-full shadow-lg hover:scale-105 transition-transform duration-300 overflow-hidden cursor-pointer"
                        onClick={handleImageClick}>
                        <Image
                        src={`http://localhost:5000${subject.img}`}
                        alt={subject.name}
                        fill
                        className="object-cover rounded-full"
                        onClick={handleImageClick}
                        />
                    </div>

                    <p className="text-lg text-gray-600 mt-4">{subject.description}</p>
                </div>
                <div className="flex justify-center mt-8 gap-6">
                    <Link
                        href={`/quiz/${subject.name}`}
                        className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
                    >
                        Take Quiz
                    </Link>
                    <Link
                        href={`/atlas/${subject.name}`}
                        className="px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out"
                    >
                        Explore Atlas
                    </Link>
                </div>
                <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-4">Topics Covered</h2>
                    <ul className="space-y-3">
                        {subject.Category?.map((Category) => (
                            <li key={Category._id} className="text-lg text-gray-700">
                                <strong className="font-semibold">{Category.category}:</strong> {Category.description}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </ProtectedPage>
    );
};

export default SubjectDetail;