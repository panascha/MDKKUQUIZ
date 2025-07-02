'use client';
import React from 'react';
import { useUser } from "@/hooks/useUser";
import { FaBars } from "react-icons/fa";
import { FaXmark } from 'react-icons/fa6';
import { IoMdNotificationsOutline } from "react-icons/io";
import toast from "react-hot-toast";
import { FrontendRoutes } from '@/config/apiRoutes';
import { useRouter } from 'next/navigation';
import { Role_type } from '@/config/role';

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
    const isAdmin = user?.role === Role_type.ADMIN || user?.role === Role_type.SADMIN;

    return (
        <>
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
                                    onClick={() => router.push(FrontendRoutes.HOMEPAGE)}
                                    className="cursor-pointer px-4 py-1.5 rounded-md hover:text-gray-200 border-1 border-transparent hover:border-gray-200 text-base font-medium transition duration-300 ease-in-out bg-transparent"
                                >
                                    Home
                                </button>
                                <button
                                    onClick={() => router.push(FrontendRoutes.QUESTION)}
                                    className="cursor-pointer px-4 py-1.5 rounded-md hover:text-gray-200 border-1 border-transparent hover:border-gray-200 text-base font-medium transition duration-300 ease-in-out bg-transparent"
                                >
                                    Question
                                </button>
                                <button
                                    onClick={() => router.push(FrontendRoutes.KEYWORD)}
                                    className="cursor-pointer px-4 py-1.5 rounded-md hover:text-gray-200 border-1 border-transparent hover:border-gray-200 text-base font-medium transition duration-300 ease-in-out bg-transparent"
                                >
                                    Keyword
                                </button>
                                <button
                                    onClick={() => router.push(FrontendRoutes.REPORT)}
                                    className="cursor-pointer px-4 py-1.5 rounded-md hover:text-gray-200 border-1 border-transparent hover:border-gray-200 text-base font-medium transition duration-300 ease-in-out bg-transparent"
                                >
                                    Report
                                </button>
                                <button
                                    onClick={() => router.push(FrontendRoutes.PROFILE)}
                                    className="cursor-pointer px-4 py-1.5 rounded-md hover:text-gray-200 border-1 border-transparent hover:border-gray-200 text-base font-medium transition duration-300 ease-in-out bg-transparent"
                                >
                                    Profile
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => router.push(FrontendRoutes.ADMIN)}
                                        className="cursor-pointer px-4 py-1.5 rounded-md hover:text-gray-200 border-1 border-transparent hover:border-gray-200 text-base font-medium transition duration-300 ease-in-out bg-transparent"
                                    >
                                        Admin
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        {user ? (
                            <>
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
            </div>
            {/* Mobile Modal/Drawer */}
            {isMenuOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/40 z-[300] transition-opacity duration-300"
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Close mobile menu overlay"
                    />
                    {/* Drawer Modal */}
                    <div
                        className="fixed top-4 right-4 w-64 max-w-[90vw] bg-white text-blue-950 shadow-2xl rounded-2xl z-[400] animate-slide-in flex flex-col divide-y divide-blue-100"
                        style={{ animation: 'slideInRight 0.3s cubic-bezier(0.4,0,0.2,1)' }}
                    >
                        <div className="flex justify-between items-center px-4 py-3">
                            <span className="font-bold text-lg">Menu</span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="text-2xl text-blue-900 hover:text-emerald-500 transition"
                                aria-label="Close menu"
                            >
                                <FaXmark />
                            </button>
                        </div>
                        <div className="flex flex-col divide-y divide-blue-100">
                            {user ? (
                                <>
                                    <button
                                        className="w-full text-left px-6 py-3 hover:bg-blue-50 font-semibold transition-all"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            router.push(FrontendRoutes.HOMEPAGE);
                                        }}>
                                        Home
                                    </button>
                                    <button
                                        className="w-full text-left px-6 py-3 hover:bg-blue-50 font-semibold transition-all"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            router.push(FrontendRoutes.QUESTION);
                                        }}>
                                        Question
                                    </button>
                                    <button
                                        className="w-full text-left px-6 py-3 hover:bg-blue-50 font-semibold transition-all"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            router.push(FrontendRoutes.KEYWORD);
                                        }}>
                                        Keyword
                                    </button>
                                    <button
                                        className="w-full text-left px-6 py-3 hover:bg-blue-50 font-semibold transition-all"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            router.push(FrontendRoutes.REPORT);
                                        }}>
                                        Report
                                    </button>
                                    <button
                                        className="w-full text-left px-6 py-3 hover:bg-blue-50 font-semibold transition-all"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            router.push(FrontendRoutes.PROFILE);
                                        }}>
                                        Profile
                                    </button>
                                    {isAdmin && 
                                        <button
                                            className="w-full text-left px-6 py-3 hover:bg-blue-50 font-semibold transition-all"
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                router.push(FrontendRoutes.ADMIN);
                                            }}>
                                            Admin
                                        </button>
                                    }
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-6 py-3 hover:bg-blue-50 font-semibold transition-all"
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
                                    className="w-full text-left px-6 py-3 hover:bg-blue-50 font-semibold transition-all"
                                >
                                    Sign in
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Keyframes for slide-in animation */}
                    <style jsx global>{`
                        @keyframes slideInRight {
                            from { transform: translateX(100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                    `}</style>
                </>
            )}
            {/* Spacer div to prevent content overlap */}
            <div className="h-16"></div>
        </>
    );
}
