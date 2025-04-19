import React from 'react'
import { useContext } from 'react'
import logo from '../assets/logo.svg'
import { AuthContext } from '../api/auth/AuthContext'
import { FaBars } from "react-icons/fa";
import { FaXmark } from 'react-icons/fa6';


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }

    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    }

    const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

    // const navItems = [
    //     { name: 'Notification', path: '/notification' },
    //     { name: 'Profile', path: '/profile' },
    // ]

    return (
        <header className='fixed top-0 left-0 w-full z-50'>
            {/* Navbar */}
            <nav className="flex items-center justify-between h-16 px-6 bg-white shadow-md">
                <div className="flex gap-2 items-center">
                    <a href="/" className="flex items-center space-x-3 text-2xl font-semibold mx-4">
                        <img src={logo} alt="Logo" className="h-8 w-8" />
                        <span>MDKKUQUIZ</span>
                    </a>
                </div>

                <div className="hidden lg:flex gap-4 items-center">
                    {isLoggedIn ? (
                        <>
                            <button className="text-base font-semibold hover:bg-gray-100 py-2 px-5 rounded">
                                Notification
                            </button>
                            <div className="relative">
                                <button onClick={toggleProfile} className="text-base font-semibold hover:bg-gray-100 py-2 px-5 rounded">
                                    Profile
                                </button>
                                {isProfileOpen && (
                                    <div className="absolute top-full mt-2 right-0 w-48 bg-white shadow-lg rounded-lg z-10 transform opacity-100 scale-100">
                                        <button onClick={() => setIsLoggedIn(false)} className="block w-full text-left py-2 px-4 hover:bg-gray-100">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <button onClick={() => setIsLoggedIn(true)} className="text-base font-semibold py-2 px-5 rounded hover:bg-gray-100">
                            Sign in
                        </button>
                    )}
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
                            {isLoggedIn ? (
                                <>
                                    <li className="py-2 px-4 hover:bg-gray-100 cursor-pointer">
                                        <button>Notification</button>
                                    </li>
                                    <li className="py-2 px-4 hover:bg-gray-100 cursor-pointer">
                                        <button>Profile</button>
                                    </li>
                                    <li className="py-2 px-4 hover:bg-gray-100 cursor-pointer">
                                        <button onClick={() => setIsLoggedIn(false)}>Logout</button>
                                    </li>
                                </>
                            )
                                : (
                                    <li className="py-2 px-4 hover:bg-gray-100 cursor-pointer">
                                        <button onClick={() => setIsLoggedIn(true)}>Sign in</button>
                                    </li>
                                )}
                        </ul>
                    </div>
                </ul>
            </div>
        </header >
    );
}

export default Navbar