'use client';
import React from 'react';
import { useUser } from "@/hooks/useUser";
import { FaBars } from "react-icons/fa";
import { FaXmark } from 'react-icons/fa6';
import { IoMdNotificationsOutline } from "react-icons/io";
import toast from "react-hot-toast";
import { FrontendRoutes } from '@/config/apiRoutes';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, logout } = useUser();
    const router = useRouter();

    const handleLogout = () => {
        toast.promise(
            new Promise((resolve, reject) => {
                logout(undefined, {
                    onSuccess: () => resolve("Logged out successfully!"),
                    onError: (error) => reject(error),
                });
            }),
            {
                loading: "Logging out...",
                success: "Logged out successfully!",
                error: "Logout failed. Please try again.",
            }
        );
    };

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);

    const toggleMenu = () => setIsMenuOpen(prev => !prev);
    const toggleProfile = () => setIsProfileOpen(prev => !prev);

    return (
        <div className="fixed top-0 left-0 w-full z-[200]">
            <nav className="flex items-center justify-between h-16 px-6 bg-blue-950 text-white shadow-md">
                {/* Logo and Home */}
                <div className="flex items-center gap-4">
                    <a href="/" className="flex items-center gap-2 hover:opacity-80 transition duration-300 ease-in-out">
                        <img src={"/MSEBlogowhite.svg"} alt="Logo" className="h-16 w-28 object-contain" />
                    </a>
                    {user && (
                        <div className="hidden lg:flex gap-3 ml-4">
                            <button
                                onClick={() => router.push('/home')}
                                className="cursor-pointer px-4 py-1.5 rounded-md hover:text-gray-200 border-1 border-transparent hover:border-gray-200 text-base font-medium transition duration-300 ease-in-out bg-transparent"
                            >
                                Home
                            </button>
                        </div>
                    )}
                </div>

                {/* Desktop Right Menu */}
                <div className="hidden lg:flex items-center gap-4">
                    {user ? (
                        <>
                            <button className="p-2 hover:bg-gray-100 hover:text-blue-950 rounded-full transition duration-300 ease-in-out cursor-pointer">
                                <IoMdNotificationsOutline size={22} />
                            </button>
                            <div className="relative">
                                <button
                                    onClick={toggleProfile}
                                    className="px-4 py-1.5 hover:bg-gray-100 hover:text-blue-950 rounded-md transition duration-300 ease-in-out font-medium cursor-pointer"
                                >
                                    {user.name}
                                </button>
                                <div
                                    className={`absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-md overflow-hidden transition-all duration-300 transform ${
                                        isProfileOpen ? 'scale-y-100 opacity-100' : 'scale-y-95 opacity-0 pointer-events-none'
                                    } origin-top`}
                                >
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => router.push(FrontendRoutes.LOGIN)}
                            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-300 text-blue-950 hover:text-blue-900 font-medium rounded-md transition duration-300 ease-in-out cursor-pointer"
                        >
                            Sign in
                        </button>
                    )}
                </div>

                {/* Mobile Menu Icon */}
                <div className="lg:hidden">
                    <button onClick={toggleMenu} className="text-xl md:text-2xl hover:text-gray-200 transition">
                        {isMenuOpen ? <FaXmark /> : <FaBars />}
                    </button>
                </div>
            </nav>

            {/* Mobile Dropdown */}
            <div
                className={`lg:hidden transition-all duration-300 ease-in-out origin-top bg-white text-black shadow-md rounded-b-sm overflow-hidden ${
                    isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="flex flex-col divide-y divide-gray-200">
                    {user ? (
                        <>
                            <button className="w-full text-center px-4 py-3 hover:bg-gray-100">
                                Notification
                            </button>
                            <button
                                className="w-full text-center px-4 py-3 hover:bg-gray-100"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    router.push(FrontendRoutes.HOMEPAGE);
                                }}>
                                Home
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full text-center px-4 py-3 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                router.push(FrontendRoutes.LOGIN);
                            }}
                            className="w-full text-center px-4 py-3 hover:bg-gray-100"
                        >
                            Sign in
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
