"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline'; // Assuming you have Heroicons installed
import { XIcon } from "lucide-react"; // Import XIcon for clear button
import { cn } from "@/lib/utils";

// Define the shape of a suggestion
export interface Suggestion {
    value: string; // The ID of the item
    label: string; // The display name of the item
    // You might want to add an optional 'originalObject' here if you need more data
    // originalObject?: any;
}

interface InputWithSuggestionProps {
    suggestions: Suggestion[];
    placeholder?: string;
    label?: string;
    debounceDelay?: number;
    // Modified onChange to pass the selected Suggestion object or null if cleared
    onChange: (name: string, item: Suggestion | null) => void;
    // The value prop now accepts the object (Subject/Category)
    // We'll infer the displayed value (label) from this object
    value: Suggestion | null;
    name: string; // Add name prop for consistent form handling
    className?: string; // Allow external classNames
}

const InputWithSuggestion: React.FC<InputWithSuggestionProps> = ({
    suggestions,
    placeholder = '',
    label = '',
    debounceDelay = 0,
    onChange,
    value, // This is the object (Subject or Category)
    name, // The field name (e.g., "subject", "category")
    className,
    ...rest // Capture any other standard input props
}) => {
    // Determine the initial inputValue from the 'value' prop's label
    const [inputValue, setInputValue] = useState(value ? value.label : '');
    const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [inlineSuggestion, setInlineSuggestion] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Update inputValue when the external 'value' prop changes
    useEffect(() => {
        setInputValue(value ? value.label : '');
    }, [value]);

    const filterSuggestions = useCallback((currentValue: string) => {
        if (!currentValue) {
            // If input is empty, return all suggestions
            return suggestions;
        }
        return suggestions.filter((suggestion) =>
            suggestion.label.toLowerCase().includes(currentValue.toLowerCase())
        );
    }, [suggestions]);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setInputValue(newValue);
        setInlineSuggestion('');
        setHighlightedIndex(-1);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            const newFilteredSuggestions = filterSuggestions(newValue);
            setFilteredSuggestions(newFilteredSuggestions);
            setShowDropdown(true); // Always show dropdown while typing

            // Determine inline suggestion
            if (newValue && newFilteredSuggestions.length > 0) {
                const exactMatch = newFilteredSuggestions.find(s =>
                    s.label.toLowerCase().startsWith(newValue.toLowerCase()) && s.label.length > newValue.length
                );
                if (exactMatch) {
                    setInlineSuggestion(exactMatch.label.substring(newValue.length));
                } else {
                    setInlineSuggestion('');
                }
            } else {
                setInlineSuggestion('');
            }

            // If the input value doesn't match any suggestion's label,
            // we might want to clear the formData for this field in the parent.
            // For now, we'll let `handleSelectSuggestion` handle the definitive setting.
            // If user types something non-matching and blurs, the parent's `value` prop
            // will revert the input field to its last valid selected value or empty.
            const matchingSuggestion = suggestions.find(s => s.label.toLowerCase() === newValue.toLowerCase());
            // if (!matchingSuggestion && onChange) {
                // If the user typed something that doesn't match a suggestion,
                // and it's not a selection, consider it "cleared" for the parent data.
                // This might be too aggressive, depending on desired behavior (allow custom input).
                // For strict suggestion matching, it's good.
                // onChange(name, null); // Pass null if no match, to clear the associated object in formData
            // }

        }, debounceDelay);
    }, [filterSuggestions, debounceDelay, suggestions, onChange, name]);

    const handleSelectSuggestion = useCallback((suggestion: Suggestion) => {
        setInputValue(suggestion.label);
        onChange(name, suggestion); // Pass the whole Suggestion object back
        setShowDropdown(false);
        setInlineSuggestion('');
        setHighlightedIndex(-1);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [onChange, name]);

    const handleArrowClick = useCallback(() => {
        if (showDropdown) {
            setHighlightedIndex(-1);
            setFilteredSuggestions([]);
            setShowDropdown(false);
        } else {
            setFilteredSuggestions(suggestions); // Show all suggestions when opening
            setShowDropdown(true);
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [showDropdown, suggestions]);

    const handleClearInput = useCallback(() => {
        setInputValue('');
        onChange(name, null); // Clear the value in the parent form
        setFilteredSuggestions(suggestions); // Show all suggestions when cleared
        setInlineSuggestion('');
        setHighlightedIndex(-1);
        setShowDropdown(true); // Keep dropdown open after clearing
        inputRef.current?.focus();
    }, [onChange, name, suggestions]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        const totalSuggestions = filteredSuggestions.length;

        if (event.key === 'Escape') {
            setShowDropdown(false);
            setHighlightedIndex(-1);
            event.preventDefault(); // Prevent default escape behavior (e.g., closing modal)
            return; // Exit early
        }

        if (showDropdown) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setHighlightedIndex(prevIndex =>
                    prevIndex === totalSuggestions - 1 ? 0 : prevIndex + 1
                );
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setHighlightedIndex(prevIndex =>
                    prevIndex === 0 ? totalSuggestions - 1 : prevIndex - 1
                );
            } else if (event.key === 'Enter') {
                event.preventDefault();
                if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
                    handleSelectSuggestion(filteredSuggestions[highlightedIndex]);
                } else if (inlineSuggestion) {
                    // Find the full suggestion object for the inline suggestion
                    const fullSuggestion = suggestions.find(s => s.label.toLowerCase() === (inputValue + inlineSuggestion).toLowerCase());
                    if (fullSuggestion) {
                        handleSelectSuggestion(fullSuggestion);
                    } else {
                        // If inline suggestion doesn't map to a real suggestion, just accept the typed text
                        setInputValue(inputValue + inlineSuggestion);
                        onChange(name, { value: inputValue + inlineSuggestion, label: inputValue + inlineSuggestion }); // Treat as custom entry
                        setShowDropdown(false);
                        setInlineSuggestion('');
                        setFilteredSuggestions([]);
                    }
                } else {
                    // If Enter is pressed without highlighted item or inline suggestion, close dropdown
                    setShowDropdown(false);
                    // If current inputValue matches a suggestion, make sure it's "selected"
                    const currentMatch = suggestions.find(s => s.label.toLowerCase() === inputValue.toLowerCase());
                    if (currentMatch) {
                        onChange(name, currentMatch);
                    } else if (inputValue) {
                        // If no match but user typed something, treat it as a custom entry
                        onChange(name, { value: inputValue, label: inputValue });
                    } else {
                        onChange(name, null); // If empty, explicitly clear
                    }
                }
            } else if (event.key === 'Tab' || event.key === ' ') {
                if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
                    handleSelectSuggestion(filteredSuggestions[highlightedIndex]);
                    event.preventDefault();
                } else if (inlineSuggestion) {
                    const fullSuggestion = suggestions.find(s => s.label.toLowerCase() === (inputValue + inlineSuggestion).toLowerCase());
                    if (fullSuggestion) {
                        handleSelectSuggestion(fullSuggestion);
                    } else {
                        setInputValue(inputValue + inlineSuggestion);
                        onChange(name, { value: inputValue + inlineSuggestion, label: inputValue + inlineSuggestion }); // Treat as custom entry
                        setShowDropdown(false);
                        setInlineSuggestion('');
                        setFilteredSuggestions([]);
                    }
                    event.preventDefault();
                } else if (event.key === 'Tab') {
                    setShowDropdown(false);
                }
            }
        } else { // Dropdown is not shown
            if (event.key === 'ArrowDown') {
                setShowDropdown(true);
                setFilteredSuggestions(suggestions);
                setHighlightedIndex(0);
                event.preventDefault(); // Prevent default scroll
            } else if ((event.key === 'Tab' || event.key === ' ') && inlineSuggestion) {
                event.preventDefault();
                setInputValue(inputValue + inlineSuggestion);
                onChange(name, { value: inputValue + inlineSuggestion, label: inputValue + inlineSuggestion });
                setInlineSuggestion('');
            }
        }
    }, [showDropdown, filteredSuggestions, highlightedIndex, handleSelectSuggestion, inputValue, inlineSuggestion, suggestions, onChange, name]);

    // Handle clicks outside the component to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
                setHighlightedIndex(-1);
                setInlineSuggestion(''); // Clear inline suggestion on outside click
                // When clicking outside, if current inputValue matches a suggestion label,
                // ensure the corresponding object is set in formData.
                const currentMatch = suggestions.find(s => s.label.toLowerCase() === inputValue.toLowerCase());
                if (currentMatch) {
                    onChange(name, currentMatch);
                } else if (inputValue) {
                    // If it's a custom value that doesn't match a suggestion
                    onChange(name, { value: inputValue, label: inputValue });
                } else {
                    // If input is empty
                    onChange(name, null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [inputValue, suggestions, onChange, name]);

    // Effect to scroll highlighted item into view
    useEffect(() => {
        if (highlightedIndex >= 0 && dropdownRef.current && showDropdown) { // Ensure dropdown is open
            const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
            if (highlightedElement) {
                highlightedElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }
        }
    }, [highlightedIndex, showDropdown]);

    const suggestionList = useMemo(() => {
        if (filteredSuggestions.length === 0 && inputValue.length > 0) { // Only "No suggestions" if typing and nothing found
            return <div className="px-4 py-2 text-sm text-gray-500">No suggestions</div>;
        }
        if (filteredSuggestions.length === 0 && inputValue.length === 0 && !showDropdown) {
             return null; // Don't show dropdown if empty and not explicitly opened
        }

        return filteredSuggestions.map((suggestion, index) => (
            <div
                key={suggestion.value}
                id={`suggestion-item-${index}`}
                className={`cursor-pointer px-4 py-2 text-sm transition-colors duration-150 ease-in-out
                            ${index === highlightedIndex ? 'bg-sky-100 text-sky-800' : 'text-gray-700'}
                            hover:bg-sky-50 hover:text-sky-700`}
                onClick={() => handleSelectSuggestion(suggestion)}
                role="option"
                aria-selected={index === highlightedIndex}
            >
                {inputValue.length > 0 && suggestion.label.toLowerCase().includes(inputValue.toLowerCase()) ? (
                    <>
                        {suggestion.label.substring(0, suggestion.label.toLowerCase().indexOf(inputValue.toLowerCase()))}
                        <span className="font-semibold">
                            {suggestion.label.substring(
                                suggestion.label.toLowerCase().indexOf(inputValue.toLowerCase()),
                                suggestion.label.toLowerCase().indexOf(inputValue.toLowerCase()) + inputValue.length
                            )}
                        </span>
                        {suggestion.label.substring(suggestion.label.toLowerCase().indexOf(inputValue.toLowerCase()) + inputValue.length)}
                    </>
                ) : (
                    suggestion.label
                )}
            </div>
        ));
    }, [filteredSuggestions, highlightedIndex, handleSelectSuggestion, inputValue, showDropdown]);


    return (
        <div className={cn("relative font-sans", className)}> {/* Apply className here */}
            {label && (
                <label htmlFor={name} className="mb-1 block text-sm font-semibold text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={name} // Use name as ID for label association
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 text-sm
                               focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                               transition-all duration-200 ease-in-out shadow-sm"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls="suggestions-list"
                    aria-expanded={showDropdown}
                    aria-activedescendant={highlightedIndex >= 0 ? `suggestion-item-${highlightedIndex}` : undefined}
                    {...rest} // Pass through any other input props
                />
                {inlineSuggestion && (
                    <div
                        className="absolute inset-0 flex items-center pl-4 text-gray-500 pointer-events-none"
                        aria-hidden="true"
                    >
                        <span className="opacity-50">{inputValue}{inlineSuggestion}</span>
                    </div>
                )}
                {inputValue && ( // Only show clear button if there's input
                    <button
                        type="button"
                        className="absolute inset-y-0 right-8 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                        onClick={handleClearInput}
                        aria-label="Clear input"
                    >
                        <XIcon className="h-4 w-4" />
                    </button>
                )}
                <div
                    className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-auto cursor-pointer"
                    onClick={handleArrowClick}
                    role="button"
                    aria-label="Toggle suggestions"
                >
                    <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                </div>
                {showDropdown && filteredSuggestions.length > 0 && ( // Only show dropdown if there are filtered suggestions
                    <div
                        ref={dropdownRef}
                        id="suggestions-list"
                        className="absolute left-0 mt-2 w-full max-h-60 overflow-y-auto rounded-lg bg-white shadow-lg z-10 border border-gray-200
                                   origin-top transform transition-all duration-200 ease-out"
                        style={{
                            opacity: showDropdown ? 1 : 0,
                            transform: showDropdown ? 'scaleY(1)' : 'scaleY(0.95)',
                        }}
                        role="listbox"
                    >
                        {suggestionList}
                    </div>
                )}
                {showDropdown && filteredSuggestions.length === 0 && inputValue.length > 0 && ( // Show "No suggestions" only when typing
                    <div className="absolute left-0 mt-2 w-full rounded-lg bg-white shadow-lg z-10 border border-gray-200">
                        <div className="px-4 py-2 text-sm text-gray-500">No suggestions found.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputWithSuggestion;