import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

// Define the structure for each suggestion, matching InputWithSuggestion
interface Suggestion {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  suggestions: Suggestion[]; // Now uses 'suggestions' instead of 'options'
  onSelect: (suggestion: Suggestion) => void; // Callback when a suggestion is selected
  placeholder?: string; // Placeholder text for the input field
  label?: string; // Optional label for the dropdown
  // Removed 'value', 'name', 'required' props to align with InputWithSuggestion's interface
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  suggestions,
  onSelect,
  placeholder = 'Select an option',
  label = '',
}) => {
  // State to hold the internally selected option
  const [selectedOption, setSelectedOption] = useState<Suggestion | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Refs for detecting clicks outside the component and for managing focus/scroll
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the visual input element

  // Toggle dropdown visibility
  const handleToggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
    // Reset highlighted index when opening/closing
    setHighlightedIndex(-1);
    // Focus the input when opening the dropdown for better accessibility
    if (!showDropdown && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showDropdown]);

  // Handle selection of an option from the dropdown
  const handleSelectOption = useCallback((suggestion: Suggestion) => {
    setSelectedOption(suggestion); // Update internal state
    onSelect(suggestion); // Call the parent's onSelect callback
    setShowDropdown(false);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus(); // Keep focus on the input after selection
    }
  }, [onSelect]);

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Escape, Tab)
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const totalSuggestions = suggestions.length;

    if (showDropdown) {
      if (event.key === 'ArrowDown') {
        event.preventDefault(); // Prevent page scroll
        setHighlightedIndex(prevIndex =>
          prevIndex === totalSuggestions - 1 ? 0 : prevIndex + 1
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault(); // Prevent page scroll
        setHighlightedIndex(prevIndex =>
          prevIndex === 0 ? totalSuggestions - 1 : prevIndex - 1
        );
      } else if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission if inside a form
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelectOption(suggestions[highlightedIndex]);
        } else if (selectedOption) {
          // If Enter is pressed without highlighting, and an option is already selected,
          // simply close the dropdown.
          setShowDropdown(false);
        }
      } else if (event.key === 'Escape') {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      } else if (event.key === 'Tab') {
        setShowDropdown(false); // Close dropdown on tab out
        setHighlightedIndex(-1);
      }
    } else {
      // If dropdown is closed and ArrowDown is pressed, open it and highlight first item
      if (event.key === 'ArrowDown') {
        setShowDropdown(true);
        setHighlightedIndex(0);
      }
    }
  }, [showDropdown, highlightedIndex, suggestions, selectedOption, handleSelectOption]);

  // Effect to handle clicks outside the component to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the main container of the component
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        showDropdown
      ) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Effect to scroll the highlighted item into view if it's off-screen
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }
  }, [highlightedIndex, showDropdown]); // Re-run when highlightedIndex changes or dropdown opens/closes

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label htmlFor={`dropdown-select-${label.replace(/\s/g, '-')}`} className="mb-1 block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Visual input element that displays the selected label */}
        <input
          id={`dropdown-select-${label.replace(/\s/g, '-')}`} // Unique ID for label association
          ref={inputRef}
          type="text"
          readOnly // Make it read-only as it's a display for the selected value
          value={selectedOption ? selectedOption.label : ''}
          placeholder={placeholder}
          onClick={handleToggleDropdown} // Open dropdown on input click
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer appearance-none"
          role="combobox"
          aria-autocomplete="none" // Since it's a fixed list, not suggesting based on typing
          aria-controls={`dropdown-list-${label.replace(/\s/g, '-')}`}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-activedescendant={highlightedIndex >= 0 ? `suggestion-item-${label.replace(/\s/g, '-')}-${highlightedIndex}` : undefined}
          tabIndex={0} // Make it focusable
        />
        <div
          className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-auto cursor-pointer"
          onClick={handleToggleDropdown}
          role="button"
          aria-label={`Toggle ${label || 'options'} dropdown`}
        >
          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
        </div>

        {/* Dropdown list with animation */}
        {showDropdown && (
          <div
            id={`dropdown-list-${label.replace(/\s/g, '-')}`}
            ref={dropdownRef}
            className="absolute left-0 mt-1 w-full max-h-60 overflow-y-auto rounded-md bg-white shadow-lg z-10 border border-gray-200
                       origin-top transform transition-all duration-200 ease-out"
            style={{
              // Apply dynamic styles for enter/exit animation
              opacity: showDropdown ? 1 : 0,
              transform: showDropdown ? 'scaleY(1)' : 'scaleY(0.95)',
            }}
            role="listbox"
          >
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.value}
                  id={`suggestion-item-${label.replace(/\s/g, '-')}-${index}`} // Unique ID for ARIA
                  className={`cursor-pointer px-4 py-2 text-sm ${
                    index === highlightedIndex ? 'bg-sky-100 text-sky-800' : 'text-gray-700'
                  } hover:bg-sky-50 hover:text-sky-700 transition-colors duration-150 ease-in-out`}
                  onClick={() => handleSelectOption(suggestion)}
                  role="option"
                  aria-selected={selectedOption?.value === suggestion.value}
                >
                  {suggestion.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No options available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownSelect;