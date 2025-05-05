'use client'
import React from 'react'
import { useUser } from "@/hooks/useUser";
import { FaBars } from "react-icons/fa";
import { FaXmark } from 'react-icons/fa6';
import { IoMdNotificationsOutline } from "react-icons/io";
import toast from "react-hot-toast";

export default function Navbar() {
    const { user, logout, isLoggingOut } =
    useUser();

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
        },
        );
    };
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }

    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    }


    return (
        <div className='fixed top-0 left-0 w-full z-200'>
            {/* Navbar */}
            <nav className="flex w-full items-center justify-between h-16 px-6 bg-white shadow-md">
                <div className="flex gap-2 items-center">
                    <a href="/" className="flex items-center space-x-3 text-2xl font-semibold mx-4">
                        {/* <Img src={} alt="Logo" className="h-8 w-8" /> */}
                        <span>MDKKUQUIZ</span>
                    </a>
                </div>

                <div className="hidden lg:flex gap-4 items-center">
                    <button className="text-base font-semibold py-3 px-4 hover:bg-gray-100 rounded transition duration-300 ease-in-out">
                        <IoMdNotificationsOutline />
                    </button>
                    <div className="relative">
                        <button onClick={toggleProfile} className="text-base font-semibold hover:bg-gray-100 py-2 px-5 rounded transition duration-300 ease-in-out">
                            {user?.name}
                        </button>
                        {isProfileOpen && (
                            <div className="absolute top-full mt-2 right-0 w-48 bg-white shadow-lg rounded-lg z-10 transform opacity-100 scale-100">
                                <button className="block w-full text-left py-2 px-4 hover:bg-gray-100"
                                onClick={handleLogout}
                                disabled={isLoggingOut}>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {/* for mobile */}
                <div className='lg:hidden block items-center'>
                    {isMenuOpen ? (
                        <button onClick={toggleMenu} className="text-2xl">
                            <FaXmark />
                        </button>
                    ) : (
                        <button onClick={toggleMenu} className="text-2xl">
                            <FaBars />
                        </button>
                    )}
                </div>
            </nav>

            {/* For mobile menu */}
            <div>
                <ul>
                    <div className={`absolute top-16 right-0 w-48 bg-white shadow-lg rounded-lg z-10 transition-all duration-300 ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 hidden'}`}>
                        <ul>
                            {user ? (
                                <>
                                    <li className="py-2 px-4 hover:bg-gray-100 cursor-pointer">
                                        <button>Notification</button>
                                    </li>
                                    <li className="py-2 px-4 hover:bg-gray-100 cursor-pointer">
                                        <button>Profile</button>
                                    </li>
                                    <li className="py-2 px-4 hover:bg-gray-100 cursor-pointer">
                                        <button onClick={handleLogout}
                                        disabled = {isLoggingOut}>
                                            Logout</button>
                                    </li>
                                </>
                            )
                                : (
                                    <li className="py-2 px-4 hover:bg-gray-100 cursor-pointer">
                                        <button >Sign in</button>
                                    </li>
                                )}
                        </ul>
                    </div>
                </ul>
            </div>
        </div >
    );
}
