"use client"
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProtectedPage from '@/components/ProtectPage';
import { useUser } from '@/hooks/useUser';
import { Role_type } from '@/config/role';

const Main = () => {
    const { user } = useUser();
    const admin = user?.role == Role_type.SADMIN || user?.role == Role_type.ADMIN;
    return (
        <ProtectedPage>
            <Navbar/>
            <div className="container mx-auto flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="flex items-center justify-center m-8">
                    <h1 className="text-4xl font-bold text-center">Welcome {user?.name}!</h1>
                </div>
                <div className="flex items-center justify-center m-4">
                    <p className="text-lg text-gray-600 text-center">what you want to do today?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full left-0 right-0 top-0 bottom-0 p-4">
                    <Link href="/subjects" className="box bg-black text-white text-center text-xl p-6 rounded shadow-md hover:bg-blue-800 transition duration-300 ease-in-out">
                        Subject
                    </Link>
                    <Link href="/atlas" className="box bg-black text-white text-center text-xl p-6 rounded shadow-md hover:bg-green-600 transition duration-300 ease-in-out">
                        Atlas
                    </Link>
                    <Link href="/keyword" className="box bg-black text-white text-center text-xl p-6 rounded shadow-md hover:bg-yellow-600 transition duration-300 ease-in-out">
                        Keyword
                    </Link>
                    <Link href="/report" className="box bg-black text-white text-center text-xl p-6 rounded shadow-md hover:bg-red-600 transition duration-300 ease-in-out">
                        Report
                    </Link>
                </div>
                {admin? (
                    <div className='grid grid-cols-1 gap-4 left-0 right-0 top-0 bottom-0 p-2 w-1/2'>
                        <Link href="/admin" className="box bg-black text-white text-center text-xl p-6 rounded shadow-md hover:bg-red-900 transition duration-300 ease-in-out">
                            Admin
                        </Link>
                    </div>
                ):(null)}
            </div>
        </ProtectedPage>
    );
};

export default Main;

