"use client";

import React from 'react';

export default function Home() {

    const [headingText, setHeadingText] = React.useState('MDKKU Self-Exam Bank');
    const [isHeadingFlipped, setIsHeadingFlipped] = React.useState(false);
    const toggleHeadingText = () => {
        setIsHeadingFlipped(!isHeadingFlipped);
        setHeadingText(isHeadingFlipped ? 'MSEB' : 'MDKKU Self-Exam Bank');
    };

    return (
        <div className="mx-4 mt-10 flex justify-center items-center min-h-screen p-10">
            <section className="flex flex-col gap-6 text-center">
                <h1
                    className="font-heading text-5xl lg:text-7xl font-bold tracking-tight text-balance cursor-pointer transition-transform duration-500 hover:scale-105"
                    onClick={toggleHeadingText}
                >
                    {headingText}
                </h1>
                <p className="text-xl text-muted-foreground max-w-[900px] mx-auto leading-7">
                Welcome to the MDKKU Self-exam Bank, your platform for collaborative medical learning. This website is designed for medical students to learn from each other and enhance their learning journey together.
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-transform duration-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4 border border-input bg-primary text-primary-foreground hover:bg-primary-dark hover:scale-105 h-10 px-4 py-2 w-[100px] hover:bg-orange-600 hover:text-white"
                        type="button"
                        href="/register"
                    >
                        Sign Up
                    </a>
                    <a
                        className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-transform duration-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4 border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:scale-105 h-10 px-4 py-2 w-[100px] hover:bg-blue-900 hover:text-white"
                        type="button"
                        href="/login"
                    >
                        Sign in
                    </a>
                </div>
                <div className="flex items-center justify-center pt-10">
                    <img
                        alt="computer image"
                        loading="lazy"
                        width="519"
                        height="200"
                        decoding="async"
                        data-nimg="1"
                        style={{
                            color: 'transparent',
                            transform: isHeadingFlipped ? 'scaleX(-1)' : 'scaleX(1)',
                        }}
                        className="hover:scale-105 transition-transform duration-500"
                        src="/window.svg"
                    />
                </div>
            </section>
        </div>
    );
}
