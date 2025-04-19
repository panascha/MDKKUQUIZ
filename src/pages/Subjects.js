import React from 'react'
import { Link } from 'react-router-dom';
import allsubjects from '../api/ImportSubject';

const Subjects = () => {

    return (
        <div className="container mx-auto p-4 mt-8">
            <h1 className="text-3xl font-bold mb-6">Subjects</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {allsubjects.map((subject) => (
                    <Link to={subject.path} key={subject.id} className="bg-white shadow-lg rounded-lg p-4 hover:bg-gray-100 shadow-xl transition duration-300 ease-in-out">
                        <img src={subject.image} alt={subject.name} className="w-full h-32 object-cover rounded-lg" />
                        <h2 className="text-xl font-semibold mt-2">{subject.name}</h2>
                        <p className="text-gray-600">{subject.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Subjects