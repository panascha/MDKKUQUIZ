// Quiz.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import allQuestions from '../api/ImportQuestion';
import allsubjects from '../api/ImportSubject';

const Quiz = () => {
    const { subjectName } = useParams();

    // API Data (Replace with actual API calls)
    const [topics, setTopics] = useState(null); // Initialize topics as null
    const [maxQuestions, setMaxQuestions] = useState(0);
    const [quizTypes] = useState(['chillquiz', 'realtest', 'custom']);
    const [answerModes] = useState(['one-by-one', 'all-at-once']);
    const [questionTypes] = useState(['mcq', 'shortanswer']);
    const [timerDurations] = useState(['30 sec', '45 sec', '1 min', '1 min 15 sec', '1 min 30 sec']);

    // State Variables
    const [quizType, setQuizType] = useState('');
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [answerMode, setAnswerMode] = useState('');
    const [questionCount, setQuestionCount] = useState(0);
    const [timerEnabled, setTimerEnabled] = useState(false);
    const [timerDuration, setTimerDuration] = useState(timerDurations[0]);
    const [questions, setQuestions] = useState([]);
    const [selectedQuestionTypes, setSelectedQuestionTypes] = useState([]);
    const [randomizedQuestions, setRandomizedQuestions] = useState(false);
    const [loading, setLoading] = useState(false); // Add loading state
    const [error, setError] = useState(null); // Add error state

    // Default Values
    const defaultValues_Question = useMemo(() => ({
        chillquiz: Math.min(10, Math.ceil(maxQuestions * 0.3)),
        realtest: Math.min(30, Math.ceil(maxQuestions * 0.8)),
        custom: maxQuestions,
    }), [maxQuestions]);

    const defaultValues_AnswerMode = useMemo(() => ({
        chillquiz: answerModes[0],
        realtest: answerModes[1],
        custom: answerModes[0],
    }), [answerModes]);

    const defaultValues_QuestionType = useMemo(() => ({
        chillquiz: ['mcq'],
        realtest: ['mcq', 'shortanswer'],
        custom: ['mcq', 'shortanswer'],
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
    const handleQuizTypeChange = useCallback((type) => {
        setQuizType(type);
        setQuestionCount(defaultValues_Question[type] || 0);
        setAnswerMode(defaultValues_AnswerMode[type] || answerModes[0]);
        setSelectedQuestionTypes(defaultValues_QuestionType[type] || []);
        setTimerEnabled(defaultValues_TimerEnabled[type] || false);
        setRandomizedQuestions(defaultValues_RandomizedQuestions[type] || false);
    }, [defaultValues_Question, defaultValues_AnswerMode, defaultValues_QuestionType, defaultValues_TimerEnabled, defaultValues_RandomizedQuestions, answerModes]);

    const handleTopicToggle = useCallback((topic) => {
        setSelectedTopics((prev) =>
            prev.includes(String(topic)) ? prev.filter((t) => t !== String(topic)) : [...prev, String(topic)]
        );
    }, []);

    const handleAnswerModeChange = useCallback((mode) => {
        setAnswerMode(mode);
    }, []);

    const handleQuestionCountChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10);
        setQuestionCount(isNaN(value) || value < 0 ? 0 : Math.min(value, maxQuestions));
    }, [maxQuestions]);

    const handleTimerDurationChange = useCallback((e) => {
        setTimerDuration(e.target.value);
    }, []);

    const handleQuestionTypeToggle = useCallback((type) => {
        setSelectedQuestionTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    }, []);

    const handleStartQuiz = useCallback(() => {
        if (!quizType || selectedTopics.length === 0 || !answerMode || questionCount <= 0 || selectedQuestionTypes.length === 0 || questionCount > maxQuestions) {
            alert('Please complete all quiz settings before starting.');
            return;
        }
        console.log({
            quizType,
            selectedTopics,
            answerMode,
            questionCount,
            timerEnabled,
            timerDuration,
            selectedQuestionTypes,
            randomizedQuestions,
            maxQuestions,
            questions // Log the questions being used
        });

    }, [quizType, selectedTopics, answerMode, questionCount, timerEnabled, timerDuration, selectedQuestionTypes, randomizedQuestions, maxQuestions, questions]);

    // Fetch Topics and Questions
    useEffect(() => {
        const abortController = new AbortController(); // Create AbortController

        const fetchSubjectData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch topics for the selected subject
                const selectedSubject = allsubjects.find(subject => subject.name.toLowerCase() === (subjectName || '').toLowerCase());
                if (selectedSubject) {
                    setTopics(selectedSubject.topics || []);
                } else {
                    setTopics(null); // Handle case where subject is not found
                }

                // Filter Questions based on selectedTopics and selectedQuestionTypes
                const filteredQuestions = allQuestions.filter(question =>
                    (!selectedTopics.length || selectedTopics.includes(String(question.topicId))) &&
                    (!selectedQuestionTypes.length || selectedQuestionTypes.includes(question.type.toLowerCase())) // แปลงเป็น Lowercase
                );
                setQuestions(filteredQuestions);
                setMaxQuestions(filteredQuestions.length);

            } catch (err) {
                if (abortController.signal.aborted) {
                    console.log("Fetch aborted");
                } else {
                    setError(err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSubjectData();

        return () => {
            abortController.abort(); // Clean up function to abort the fetch
        };
    }, [subjectName, selectedTopics, selectedQuestionTypes]);

    // Memoize topic IDs for dependency array
    const topicIds = useMemo(() => topics ? topics.map(topic => topic.id) : [], [topics]);

    return (
        <div className="container p-10 lg:p-20 rounded-lg mt-2 mx-auto justify-center bg-white animate-fade-in">
            <Link to="/subjects" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out mb-4">
                <h1 className="text-4xl font-bold text-center mb-6 animate-slide-down">Quiz for {subjectName}</h1>
            </Link>

            {/* Loading State */}
            {loading && <div className="text-center">Loading...</div>}

            {/* Error State */}
            {error && <div className="text-center text-red-500">Error: {error.message}</div>}

            {/* Topic Selection */}
            {topics && (
                <div className="mb-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-semibold mb-2">Select Topics</h2>
                        <button
                            className="px-4 py-2 rounded-lg text-lg font-medium bg-secondary text-white transition-transform duration-300 transform hover:scale-105"
                            onClick={() => {
                                if (selectedTopics.length === topicIds.length) {
                                    setSelectedTopics([]); // Deselect all
                                } else {
                                    setSelectedTopics(topicIds); // Select all
                                }
                            }}
                        >
                            {selectedTopics.length === topicIds.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-3">
                        {topics.map((topic) => (
                            <button
                                key={topic.id}
                                className={`px-4 py-2 rounded-lg text-lg font-medium transition-colors duration-300 transform hover:scale-105 ${selectedTopics.includes(String(topic.id)) ? 'bg-quaternary text-black' : 'bg-gray-300'}`}
                                onClick={() => handleTopicToggle(topic.id)}
                            >
                                {topic.name} {/* ใช้ topic.name แทน topic.id */}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Quiz Type Selection */}
            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Choose Quiz Type</h2>
                <div className="grid grid-cols-3 gap-4">
                    {quizTypes.map((type) => (
                        <button
                            key={type}
                            className={`px-4 py-2 rounded-lg text-lg font-medium transition-transform duration-300 transform hover:scale-105 ${quizType === type ? 'bg-secondary text-white' : 'bg-gray-300'}`}
                            onClick={() => handleQuizTypeChange(type)}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1).replace('quiz', ' Quiz')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Answer Mode Selection */}
            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Answer Mode</h2>
                <div className="grid grid-cols-2 gap-4">
                    {answerModes.map((mode) => (
                        <button
                            key={mode}
                            className={`px-4 py-2 rounded-lg text-lg font-medium transition-transform duration-300 transform hover:scale-105 ${answerMode === mode ? 'bg-secondary text-white' : 'bg-gray-300'}`}
                            onClick={() => handleAnswerModeChange(mode)}
                        >
                            {mode.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </button>
                    ))}
                </div>
            </div>

            {/* Question Type Selection */}
            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Question Type</h2>
                <div className="grid grid-cols-2 gap-4">
                    {questionTypes.map((type) => {
                        const countForType = questions.filter((q) => q.type === type).length;
                        return (
                            <button
                                key={type}
                                className={`px-4 py-2 rounded-lg text-lg font-medium transition-transform duration-300 transform hover:scale-105 ${selectedQuestionTypes.includes(type) ? 'bg-secondary text-white' : 'bg-gray-300'}`}
                                onClick={() => handleQuestionTypeToggle(type)}
                            >
                                {type.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} ({countForType})
                                {selectedQuestionTypes.includes(type) ? ' (Selected)' : ''}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Number of Questions Selection */}
            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Number of Questions</h2>
                <input
                    type="number"
                    className="border rounded-lg px-4 py-2 w-full text-lg"
                    value={questionCount}
                    onChange={handleQuestionCountChange}
                    placeholder={`Max: ${maxQuestions}`}
                />
                <p className="text-sm text-gray-600 mt-1">Selected Questions: {questionCount}</p>
                <p className="text-sm text-gray-600 mt-1">Total Questions Available: {questions.length}</p>
            </div>

            {/* Timer Selection */}
            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Timer</h2>
                <label className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        checked={timerEnabled}
                        onChange={(e) => setTimerEnabled(e.target.checked)}
                        className="w-5 h-5"
                    />
                    <span className="text-lg">Enable Timer</span>
                </label>
                {timerEnabled && (
                    <select
                        className="border rounded-lg px-4 py-2 mt-3 w-full text-lg"
                        value={timerDuration}
                        onChange={handleTimerDurationChange}
                    >
                        {timerDurations.map((duration) => (
                            <option key={duration} value={duration}>
                                {duration}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Randomized Questions Selection */}
            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Randomize Questions</h2>
                <label className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        checked={randomizedQuestions}
                        onChange={(e) => setRandomizedQuestions(e.target.checked)}
                        className="w-5 h-5"
                    />
                    <span className="text-lg">Enable Randomization</span>
                </label>
            </div>

            {/* Start Quiz Button */}
            <Link
                to={`/quiz/${subjectName}/problem`}
                state={{
                    quizType,
                    selectedTopics,
                    answerMode,
                    questionCount,
                    timerEnabled,
                    timerDuration,
                    selectedQuestionTypes,
                    randomizedQuestions,
                    questions,
                }}
                className="px-6 py-3 bg-secondary text-white rounded-lg text-lg font-bold w-full transition-transform duration-300 transform hover:scale-105 animate-fade-in"
                onClick={handleStartQuiz}
            >
                Start Quiz
            </Link>
        </div >
    );
};

export default Quiz;