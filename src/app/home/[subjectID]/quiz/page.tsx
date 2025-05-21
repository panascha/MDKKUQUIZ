'use client'
import { ButtonWithLogo } from "@/components/magicui/Buttonwithlogo";
import ProtectedPage from "@/components/ProtectPage";
import { BackendRoutes, FrontendRoutes, getCategoryBySubjectID, getQuizByFilter } from "@/config/apiRoutes";
import { Category } from "@/types/api/Category";
import { Quiz } from "@/types/api/Quiz";
import { Subject } from "@/types/api/Subject";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderIcon } from "react-hot-toast";

export default function quiz(){
    type QuizType = "chillquiz" | "realtest" | "custom";
    type AnswerModes = "reveal-at-end"| "reveal-after-each"
    const quizTypes: QuizType[] = ["chillquiz", "realtest", "custom"];
    const answerModes: AnswerModes[] = ["reveal-at-end", "reveal-after-each"];
    const questionTypes = ["mcq", "shortanswer"];

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
    const [maxQuestions, setMaxQuestions] = useState(0);
    const params = useParams();
    const router = useRouter();;
    const subjectID = params.subjectID;

    const { data: session } = useSession();
    useEffect(() => {
        if (!subjectID) return;
        if (!session) return;
    
        const fetchCategoryAndQuiz = async () => {
          try {
            setIsLoading(true);

            console.log(`${BackendRoutes.CATEGORY}/subject/${subjectID}`);
            const Category = await axios.get(`${BackendRoutes.CATEGORY}/subject/${subjectID}`, {
            headers: { Authorization: `Bearer ${session.user.token}` },
          });
            const Quiz = await axios.get(`${BackendRoutes.QUIZ}/filter/${subjectID}`, {
            headers: { Authorization: `Bearer ${session.user.token}` },
          });

            setCategory(Category.data.data);
            setSubject(Category.data.data[0]?.subject); 
            setQuiz(Quiz.data.data);
            setMaxQuestions(Quiz.data.data.length);

            setIsLoading(false);
          } catch (err) {
            setError(`Failed to fetch category as : ${err}`);
            setIsLoading(false);
          }
        };

        fetchCategoryAndQuiz();
    }, [subjectID]);

    // Default Values
    const defaultValues_Question = useMemo(() => ({
        chillquiz: Math.min(10, Math.ceil(maxQuestions * 0.3)),
        realtest: Math.min(30, Math.ceil(maxQuestions * 0.8)),
        custom: maxQuestions,
    }), [maxQuestions]);

    const defaultValues_AnswerMode = useMemo(() => ({
        chillquiz: answerModes[1],
        realtest: answerModes[0],
        custom: answerModes[0],
    }), [answerModes]);

    const defaultValues_QuestionType = useMemo(() => ({
        chillquiz: 'mcq',
        realtest: 'mcq',
        custom: 'shortanswer',
    }), []);

    const defaultValues_TimerEnabled = useMemo(() => ({
        chillquiz: false,
        realtest: true,
        custom: false,
    }), []);

    const defaultValues_RandomizedQuestions = useMemo(() => ({
        chillquiz: true,
        realtest: false,
        custom: false,
    }), []);
    
    // Event Handlers
    const handleQuizTypeChange = useCallback((type: QuizType) => {
        setQuizType(type);
        setQuestionCount(defaultValues_Question[type] || 0);
        setAnswerMode(defaultValues_AnswerMode[type] || answerModes[0]);
        setSelectedQuestionTypes(defaultValues_QuestionType[type] || '');
    }, [defaultValues_Question, defaultValues_AnswerMode, defaultValues_QuestionType, defaultValues_TimerEnabled, defaultValues_RandomizedQuestions, answerModes]);

    const handleTopicToggle = useCallback((category:string) => {
        setSelectCategory((prev) =>
            prev.includes(String(category)) ? prev.filter((t) => t !== String(category)) : [...prev, String(category)]
        );
    }, []);

    const handleAnswerModeChange = useCallback((mode: AnswerModes) => {
        setAnswerMode(mode);
    }, []);

    const handleQuestionCountChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = Number(e.target.value);
            const maxAvailableQuestions = selectedQuestionTypes.includes('mcq')
            ? quiz.length
            : quiz.filter(q => q.type === "written").length;

            setQuestionCount(value > 0 ? Math.min(value, maxAvailableQuestions) : 0);
        },
        [selectedQuestionTypes, quiz]
    );

    const handleQuestionTypeChange = useCallback((type:string) => {
        setSelectedQuestionTypes(type);
    }, []);

    const handleStartQuiz = useCallback(() => {
    if (!quizType || selectCategory.length === 0 || !answerMode || questionCount <= 0 || selectedQuestionTypes.length === 0 || questionCount > maxQuestions) {
        alert('Please complete all quiz settings before starting.');
        return;
    }
    else {
        router.push(`${FrontendRoutes.HOMEPAGE}/${subjectID}/quiz/problem?${queryParams}`);
    }
    // No need to do anything else here if you handle sending via Link href
    }, [quizType, selectCategory, answerMode, questionCount, selectedQuestionTypes, maxQuestions]);

    const queryParams = new URLSearchParams({
    quizType,
    answerMode,
    questionCount: questionCount.toString(),
    questionType: selectedQuestionTypes,
    categories: selectCategory.join(','), 
    }).toString();

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
        <ProtectedPage>
            <div className="container max-w-5xl p-8 md:p-16 rounded-lg mt-6 mx-auto bg-white shadow-lg animate-fade-in pt-24">
                <Link href="/subjects" className="flex items-center gap-2 text-black hover:text-orange-800 transition duration-300 ease-in-out mb-6">
                <h1 className="text-4xl font-bold text-center animate-slide-down">
                    Quiz for {subject?.name}
                </h1>
                </Link>

                {/* Topic Selection */}
                <section className="mb-8 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-2xl font-semibold text-gray-800">Select Topics</h2>
                    <button
                    className="cursor-pointer px-5 py-2 rounded-lg text-lg bg-yellow-600 text-white shadow-md hover:bg-orange-500 transition transform hover:scale-105 duration-300"
                    onClick={() => {
                        if (selectCategory.length === category.length) {
                        setSelectCategory([]);
                        } else {
                        setSelectCategory(category.map(cat => cat._id));
                        }
                    }}
                    aria-label="Toggle select all topics"
                    >
                    {selectCategory.length === category.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
                <div className="flex flex-wrap gap-4">
                    {category.map((cat) => (
                    <button
                        key={cat._id}
                            className={`
                        cursor-pointer px-4 py-2 rounded-lg text-lg bg-gray-200 text-gray-800 shadow-md hover:bg-gray-300 hover:text-gray-900 transition transform hover:scale-105 duration-300
                        focus:outline-none
                        ${selectCategory.includes(String(cat._id)) ? 'bg-orange-500 text-white' : ''}
                        ${selectCategory.includes(String(cat._id)) ? 'text-black shadow-inner' : ''}

                        `}
                        onClick={() => handleTopicToggle(cat._id)}
                        aria-pressed={selectCategory.includes(String(cat._id))}
                    >
                        {cat.category}
                    </button>
                    ))}
                </div>
                </section>

                {/* Quiz Type Selection */}
                <section className="mb-8 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Choose Quiz Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {quizTypes.map((type) => (
                    <ButtonWithLogo
                        key={type}
                        className={`
                        px-2 py-4 transition-transform duration-300 transform hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-orange-400
                        ${quizType === type ? 'ring-3 ring-orange-600 text-gray-900' : ''}
                        `}
                        onClick={() => handleQuizTypeChange(type)}
                        aria-pressed={quizType === type}
                    >
                        {type === 'chillquiz' ? 'Chill Quiz' : type === 'realtest' ? 'Real Test' : 'Custom Quiz'}
                    </ButtonWithLogo>
                    ))}
                </div>
                </section>

                {/* Answer Mode */}
                <section className="mb-8 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Answer Mode</h2>
                <div className="grid grid-cols-2 gap-6">
                    {answerModes.map((mode) => (
                    <ButtonWithLogo
                        key={mode}
                        className={`
                        px-6 py-3 transition-transform duration-300 transform hover:scale-105
                        
                        focus:outline-none focus:ring-2 focus:ring-orange-400
                        ${answerMode === mode ? 'ring-3 ring-orange-600 text-gray-900 shadow-lg' : ''}
                        `}
                        onClick={() => handleAnswerModeChange(mode)}
                        aria-pressed={answerMode === mode}
                        >
                        <span className="block md:inline">
                        {mode.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            <span className="inline md:hidden">{'\n'}</span>
                        </span>
                    </ButtonWithLogo>
                    ))}
                </div>
                </section>

                {/* Question Type */}
                <section className="mb-8 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Question Type</h2>
                <div className="grid grid-cols-2 gap-6">
                    {questionTypes.map((type) => (
                    <ButtonWithLogo
                        key={type}
                        className={`
                            px-6 py-6 md:py-3 transition-transform duration-300 transform hover:scale-105
                            focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm md:text-lg
                            ${selectedQuestionTypes === type ? 'ring-3 ring-orange-600 text-gray-900 shadow-lg' : ''}
                        `}
                        onClick={() => handleQuestionTypeChange(type)}
                        aria-pressed={selectedQuestionTypes === type}
                    >
                        <span className="block md:inline">
                            {type === 'mcq' ? 'MCQ' : type === 'shortanswer' ? 'Short answer' : type}
                            <span className="inline md:hidden">{'\n'}</span>
                        </span>
                    </ButtonWithLogo>
                    ))}
                </div>
                </section>

                {/* Number of Questions */}
                <section className="mb-8 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Number of Questions</h2>
                <div className="flex items-center justify-center gap-4">
                    <button
                        className="cursor-pointer px-5 py-2 bg-gray-300 rounded-lg text-lg font-semibold transition-transform duration-300 transform hover:scale-105"
                        onClick={() => setQuestionCount((prev) => Math.max(0, prev - 5))}
                        aria-label="Decrease number of questions"
                        >
                        -
                    </button>
                    <input
                        type="input"
                        className="border border-gray-300 rounded-lg px-5 py-2 w-24 text-lg text-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={questionCount}
                        onChange={handleQuestionCountChange}
                        placeholder={`Max: ${quiz.length}`}
                        min={0}
                        max={quiz.length}
                        aria-label="Number of questions"
                    />
                    <button
                        className="cursor-pointer px-5 py-2 bg-gray-300 rounded-lg text-lg font-semibold transition-transform duration-300 transform hover:scale-105"
                        onClick={() => setQuestionCount((prev) => Math.min(quiz.length, prev + 5))}
                        aria-label="Increase number of questions">
                        +
                    </button>
                </div>
                <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto text-center">
                    {selectedQuestionTypes.includes('mcq') && `MCQ Questions Available: ${quiz.length}`}
                    {selectedQuestionTypes.includes('shortanswer') && `Short Answer Questions Available: ${quiz.filter(q => q.type === "written").length}`}
                </p>
                </section>
                <ButtonWithLogo
                    onClick={handleStartQuiz}
                    className="
                        w-full
                        px-6 py-3
                        text-lg font-semibold
                        text-white text-center
                        rounded-2xl
                        bg-gradient-to-r from-cyan-500 to-blue-600
                        shadow-lg hover:shadow-xl
                        transition-all duration-300 ease-in-out
                        hover:scale-102 hover:brightness-110
                        focus:outline-none focus:ring-2 focus:ring-orange-400
                        animate-fade-in
                    "
                    emoji={<span role="img" aria-label="emoji">৻(  •̀ ᗜ •́  ৻)</span>}
                >
                    🚀 Start Quiz
                </ButtonWithLogo>

            </div>
        </ProtectedPage>
    );
}