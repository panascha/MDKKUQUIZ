'use client'
import { BackendRoutes, getCategoryBySubjectID, getQuizByFilter } from "@/config/apiRoutes";
import { Category } from "@/types/api/Category";
import { Quiz } from "@/types/api/Quiz";
import { Subject } from "@/types/api/Subject";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoaderIcon } from "react-hot-toast";

export default function quiz(){
    const [quizType, setQuizType] = useState('');
    const [answerMode, setAnswerMode] = useState('');
    const [selectedQuestionTypes, setSelectedQuestionTypes] = useState('');
    const [questionCount, setQuestionCount] = useState(0);

    const [subject, setSubject] = useState<Subject>();
    const [category, setCategory] = useState<Category[]>([]);
    const [quiz, setQuiz] = useState<Quiz[]>([]);
    const [selectCategory, setSelectCategory] = useState<String[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const subjectID = params.subjectID;

    const quizTypes = ["dailyquiz", "customquiz", "mockquiz"];
    const answerModes = ["reveal-at-end", "reveal-after-each"];
    const questionTypes = ["mcq", "shortanswer"];
    const { data: session } = useSession();
    useEffect(() => {
        if (!subjectID) return;
    
        const fetchCategoryAndQuiz = async () => {
          try {
            setIsLoading(true);

            console.log(`${BackendRoutes.CATEGORY}/subject/${subjectID}`);
            const Category = await axios.get(`${BackendRoutes.CATEGORY}/subject/${subjectID}`);
            const Quiz = await axios.get(`${BackendRoutes.QUIZ}/filter/${subjectID}`);

            setCategory(Category.data.data);
            setSubject(category[0].subject);
            setQuiz(Quiz.data.data);

            setIsLoading(false);
          } catch (err) {
            setError(`Failed to fetch category as : ${err}`);
            setIsLoading(false);
          }
        };

        fetchCategoryAndQuiz();
    }, [subjectID]);
    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-3 pt-20">
              <LoaderIcon /> Loading...
            </div>
          );          
    }
    
    if (error) {
        return (
            <div className="text-red-500 flex items-center gap-2 pt-20">
              <span>Error:</span> {error}
            </div>
          );          
    }
    
    if (!subject) {
        return (
            <div className="text-red-500 pt-20">Subject not found</div>
          );          
    }

    if (!category) {
        return (
            <div className="text-red-500 pt-20">Category not found</div>
          );          
    }

    if (!quiz) {
        return (
            <div className="text-red-500 pt-20">Quiz not found</div>
          );          
    }
    return(
        <div className="container p-10 lg:p-20 rounded-lg mt-2 mx-auto justify-center bg-white animate-fade-in shadow-md pt-20">
            <Link href="/subjects" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out mb-4">
                <h1 className="text-4xl font-bold text-center mb-6 animate-slide-down">Quiz for {subject?.name}</h1>
            </Link>

            {/* Topic Selection */}
            <div className="mb-6 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-semibold mb-2">Select Topics</h2>
                    <button
                        className="px-4 py-2 rounded-lg text-lg font-medium bg-secondary text-white transition-transform duration-300 transform hover:scale-105"
                        onClick={() => {
                            if (selectCategory.length === category.length) {
                                setSelectCategory([]); // Deselect all
                            } else {
                                setSelectCategory(category.map(category => category.category)); // Select all topic IDs
                            }
                        }}
                    >
                        {selectCategory.length === category.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
                <div className="flex flex-wrap gap-3 mb-3">
                    {category.map((category) => (
                        <button
                            key={category._id}
                            className={`px-4 py-2 rounded-lg text-lg font-medium transition-colors duration-300 transform hover:scale-105 ${selectCategory.includes(String(category._id)) ? 'bg-quaternary text-black' : 'bg-gray-300'}`}
                            //onClick={() => handleTopicToggle(category.categoryId)}
                        >
                            {category.category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quiz Type Selection */}
            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Choose Quiz Type</h2>
                <div className="grid grid-cols-3 gap-4">
                    {quizTypes.map((type) => (
                        <button
                            key={type}
                            className={`px-4 py-2 rounded-lg text-lg font-medium transition-transform duration-300 transform hover:scale-105 ${quizType === type ? 'bg-secondary text-white' : 'bg-gray-300'}`}
                            //onClick={() => handleQuizTypeChange(type)}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1).replace('quiz', ' Quiz')}
                        </button>
                    ))}
                </div>
            </div>
            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Answer Mode</h2>
                <div className="grid grid-cols-2 gap-4">
                    {answerModes.map((mode) => (
                        <button
                            key={mode}
                            className={`px-4 py-2 rounded-lg text-lg font-medium transition-transform duration-300 transform hover:scale-105 ${answerMode === mode ? 'bg-secondary text-white' : 'bg-gray-300'}`}
                            //onClick={() => handleAnswerModeChange(mode)}
                        >
                            {mode.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </button>
                    ))}
                </div>
            </div>


            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Question Type</h2>
                <div className="grid grid-cols-2 gap-4">
                    {questionTypes.map((type) => (
                            <button
                                key={type}
                                className={`px-4 py-2 rounded-lg text-lg font-medium transition-transform duration-300 transform hover:scale-105 ${selectedQuestionTypes === type ? 'bg-secondary text-white' : 'bg-gray-300'}`}
                                //onClick={() => handleQuestionTypeChange(type)}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                    ))}
                </div>
            </div>
            {/* <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Number of Questions</h2>
                <div className="flex items-center gap-4">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded-lg text-lg font-medium transition-transform duration-300 transform hover:scale-105"
                        //onClick={() => setQuestionCount((prev) => Math.max(0, prev - 5))}
                    >
                        -
                    </button>
                    <input
                        type="number"
                        className="border rounded-lg px-4 py-2 w-20 text-lg text-center"
                        value={questionCount}
                        //onChange={handleQuestionCountChange}
                        placeholder={`Max: ${maxQuestions}`}
                    />
                    <button
                        className="px-4 py-2 bg-gray-300 rounded-lg text-lg font-medium transition-transform duration-300 transform hover:scale-105"
                        onClick={() => setQuestionCount((prev) => Math.min(maxQuestions, prev + 5))}
                    >
                        +
                    </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                    {selectedQuestionTypes.includes('mcq') && `MCQ Questions Available: ${questions.length}`}
                    {selectedQuestionTypes.includes('shortanswer') && `Short Answer Questions Available: ${questions.filter(q => q.mcq_only === false).length}`}
                </p>
            </div> */}
            {/*
            {useEffect(() => {
                const maxAvailableQuestions = selectedQuestionTypes.includes('mcq')
                    ? questions.length
                    : questions.filter(q => q.mcq_only === false).length;
                setQuestionCount(maxAvailableQuestions);
            }, [selectedQuestionTypes, questions])}

            <Link
                to={`/quiz/${subjectName}/problem`}
                onClick={handleStartQuiz}
                state={{
                    subjectname,
                    questions,
                    selectedTopics,
                    answerMode,
                    questionCount,
                    timerEnabled,
                    timerDuration,
                    selectedQuestionTypes,
                    randomizedQuestions,
                    selectedTopicName,
                }}
                className="px-6 py-3 bg-secondary text-white rounded-lg text-lg font-bold w-full transition-transform duration-300 transform hover:scale-105 animate-fade-in"
            >
                Start Quiz
            </Link> */}
        </div >
    );
}