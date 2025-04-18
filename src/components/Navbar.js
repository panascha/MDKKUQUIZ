import React from 'react'
import { NavLink } from 'react-router-dom'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }

    const [isLoggedIn, setIsLoggedIn] = React.useState(true);
    const handleLogin = () => {
        setIsLoggedIn(true);
    }

    const navItems = [
        { name: 'Notification', path: '/notification' },
        { name: 'Profile', path: '/profile' },
    ]

    return (
        <nav className="flex items-center justify-between h-16 px-6 bg-white shadow-md">

            <div className='flex gap-2 items-center'>
                <a href="/" className="flex items-center space-x-3 text-2xl font-semibold mx-4">
                    <img src={logo} alt="Logo" className="h-8 w-8" />
                    <span>MDKKUQUIZ</span>
                </a>
            </div>

            <div className="hidden gap-4 items-center lg:flex">
                {isLoggedIn ? (
                    <>
                        {navItems.map((item) => (
                            <NavLink key={item.name} to={item.path} className="text-base text-primary font-semibold hover:bg-gray-100 py-2 px-5 rounded">
                                {item.name}
                            </NavLink>
                        ))}
                        <button onClick={() => setIsLoggedIn(false)} className="text-base text-primary font-semibold hover:bg-gray-100 py-2 px-5 rounded">
                            Logout
                        </button>
                    </>
                ) : (
                    <Link onClick={() => setIsLoggedIn(true)} className="text-base text-primary font-semibold py-2 px-5 rounded hover:bg-gray-100">
                        Sign in
                    </Link>
                )}
            </div>

        </nav>
    )
}

export default Navbar