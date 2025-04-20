import React from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import allsubjects from '../api/ImportSubject';
import { IoIosArrowBack } from "react-icons/io";


const SubjectDetail = () => {
    const { subjectName } = useParams();

    // Find the subject based on the URL parameter
    const subject = allsubjects.find(
        (sub) => sub.name.toLowerCase() === (subjectName || '').toLowerCase()
    );

    if (!subject) {
        return <div>Subject not found</div>;
    }

    const handleImageClick = (e) => {
        const image = e.target;
        image.classList.add('shake');
        setTimeout(() => {
            image.classList.remove('shake');
        }, 500); // Duration of the shake animation
    };

    return (
        <div className="container mx-auto p-4 mt-10">
            <Link
                to="/subjects"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out"
            >
                <IoIosArrowBack className="text-xl" />
                <span className="text-lg font-medium">Back to Subjects</span>
            </Link>
            <div className="text-center mt-6">
                <h1 className="text-4xl font-extrabold mb-6">{subject.name}</h1>
                <button>
                    <img
                        src={subject.image}
                        alt={subject.name}
                        className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
                        onClick={handleImageClick}
                    />
                </button>
                <p className="text-lg text-gray-600 mt-4">{subject.description}</p>
            </div>
            <div className="flex justify-center mt-8 gap-6">
                <Link
                    to={`/quiz/${subjectName}`}
                    className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
                >
                    Take Quiz
                </Link>
                <Link
                    to={`/atlas/${subjectName}`}
                    className="px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out"
                >
                    Explore Atlas
                </Link>
            </div>
            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">Topics Covered</h2>
                <ul className="space-y-3">
                    {subject.topics.map((topic) => (
                        <li key={topic.id} className="text-lg text-gray-700">
                            <strong className="font-semibold">{topic.name}:</strong> {topic.description}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SubjectDetail;