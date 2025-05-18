"use client";
import React, { useState } from 'react';
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { BackendRoutes, FrontendRoutes } from '@/config/apiRoutes';
import { Quiz } from '@/types/api/Quiz';
import ProtectedPage from '@/components/ProtectPage';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import Table from '@/components/ui/Table';
import { IoIosArrowBack } from "react-icons/io";


const fetchQuestion = async (): Promise<Array<Quiz>> => {
    const response = await axios.get(BackendRoutes.QUIZ);
    if (Array.isArray(response.data)) {
        return response.data;
    }
    throw new Error("Failed to fetch questions");
};

const Questions = () => {
    const router = useRouter();
    const [questions, setQuestions] = useState<Quiz[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    return (
        <ProtectedPage>
            <div className="container mx-auto p-4 mt-20 justify-center items-center flex flex-col">
                <div className="absolute top-23 md:top-25 left-8 md:left-15 text-lg">
                    <button onClick={() => router.push(FrontendRoutes.MAIN)} className="flex items-center mb-4 hover:bg-orange-400 hover:text-white p-2 rounded-sm transition duration-300 ease-in-out hover:opacity-80 cursor-pointer">
                        <span className='flex items-center'> <IoIosArrowBack className="text-xl" /> Back</span>
                    </button>
                </div>
                <div className='absolute top-22 md:top-25 right-4 md:right-15'>
                    <button onClick={() => router.push(FrontendRoutes.QUESTION_CREATE)} className="border-1 mb-4 hover:bg-green-600 hover:text-white pl-2 p-3 rounded-sm transition duration-300 ease-in-out hover:opacity-60 cursor-pointer">
                        + Create
                    </button>
                </div>
                <h1 className="text-3xl font-bold text-center mb-4">Question List</h1>

                {/* Search and filter section */}
                <section className="flex flex-col gap-4 mt-3 mx-auto p-2 sm:p-4 md:p-6 w-full max-w-5xl items-center justify-center md:flex-row md:justify-between">
                    <div className="flex flex-col gap-2 w-full md:w-7/12">
                        <label htmlFor="search" className="text-sm md:text-md text-center md:text-left">
                            Search:
                            <small className="ml-2 text-gray-500">
                                Try Pubmed search e.g. "strongyloides stercoralis" and/or/not "hookworm"
                            </small>
                        </label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Search from Name of Keyword, Keyword"
                            className="border border-gray-300 rounded-md p-2 w-full"
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-5/12 md:flex-row md:gap-4">
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm md:text-md text-center md:text-left hidden md:block">
                                Filter subject:
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="hover:bg-gray-200 border border-gray-300 rounded-md p-2 w-full transition duration-300 ease-in-out cursor-pointer">
                                    All Subjects
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48 sm:w-56">
                                    <DropdownMenuItem>Subject 1</DropdownMenuItem>
                                    <DropdownMenuItem>Subject 2</DropdownMenuItem>
                                    <DropdownMenuItem>Subject 3</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm md:text-md text-center md:text-left hidden md:block">
                                Filter topic:
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="hover:bg-gray-200 border border-gray-300 rounded-md p-2 w-full transition duration-300 ease-in-out cursor-pointer">
                                    All Topics
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48 sm:w-56">
                                    <DropdownMenuItem>Topic 1</DropdownMenuItem>
                                    <DropdownMenuItem>Topic 2</DropdownMenuItem>
                                    <DropdownMenuItem>Topic 3</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </section>
                <Table headers={["#", "question", "answer", "status"]} data={[
                    {
                        "#": 1,
                        question: { path: "/question/1", label: "What is the capital of France?" },
                        answer: "Paris",
                        status: "active"
                    },
                    {
                        "#": 2,
                        question: { path: "/question/2", label: "What is the capital of Germany?" },
                        answer: "Berlin",
                        status: "inactive"
                    },
                    {
                        "#": 3,
                        question: { path: "/question/3", label: "What is the capital of Italy?" },
                        answer: "Rome",
                        status: "active"
                    }
                ]} />


            </div>
        </ProtectedPage>
    );
};

export default Questions;