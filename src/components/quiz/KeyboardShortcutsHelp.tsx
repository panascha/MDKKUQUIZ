"use client";
import React, { useState } from 'react';
import { KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUp, KeyboardArrowDown, Help } from '@mui/icons-material';

export default function KeyboardShortcutsHelp() {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="hidden lg:block fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 z-40"
                title="Keyboard Shortcuts"
            >
                <Help className="text-xl" />
            </button>

            {isVisible && (
                <div className="hidden lg:block fixed bottom-20 right-6 bg-white rounded-lg shadow-xl p-4 border border-gray-200 z-50 min-w-[280px]">
                    <h3 className="font-semibold text-gray-800 mb-3 text-center">Keyboard Shortcuts</h3>
                    
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Previous Question</span>
                            <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                                <KeyboardArrowLeft className="text-sm" />
                                <span className="ml-1 text-xs">Left</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Next Question</span>
                            <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                                <KeyboardArrowRight className="text-sm" />
                                <span className="ml-1 text-xs">Right</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Previous Answer</span>
                            <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                                <KeyboardArrowUp className="text-sm" />
                                <span className="ml-1 text-xs">Up</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Next Answer</span>
                            <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                                <KeyboardArrowDown className="text-sm" />
                                <span className="ml-1 text-xs">Down</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            * Arrow keys work for MCQ questions only
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
