interface QuizResultFilterProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filter: 'all' | 'correct' | 'incorrect';
    setFilter: (filter: 'all' | 'correct' | 'incorrect') => void;
    showDropdown: boolean;
    toggleDropdown: () => void;
}

export const QuizResultFilter = ({
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    showDropdown,
    toggleDropdown,
}: QuizResultFilterProps) => {
    const handleFilter = (filterType: 'all' | 'correct' | 'incorrect') => {
        setFilter(filterType);
        toggleDropdown();
    };

    return (
        <section className="flex flex-col md:flex-row gap-4 mt-3 mx-4 p-4 md:p-6 sm:mx-10 w-full md:w-2/3 items-end">
            <div className="flex flex-col gap-2 w-full md:w-7/10">
                <label htmlFor="search" className="text-sm md:text-md">
                    Search:
                    <small className="ml-2 text-gray-500">
                        Try Pubmed search e.g. "strongyloides stercoralis" and/or/not "hookworm"
                    </small>
                </label>
                <input
                    id="search"
                    type="text"
                    placeholder="Search from Topic, Question, Choices, Your answer, Correct answer"
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex flex-row gap-4 w-full md:w-3/10">
                <div className="flex flex-col gap-2 w-1/2">
                    <label htmlFor="filter" className="text-sm md:text-md">Filter:</label>
                    <div className="relative w-full">
                        <button
                            className="bg-white border-gray-300 border-2 rounded-md p-2 flex items-center gap-2 justify-center h-full w-full hover:bg-gray-100 cursor-pointer sm:text-sm"
                            onClick={toggleDropdown}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                        {showDropdown && (
                            <div className="absolute bg-white border border-gray-300 rounded-md mt-2 w-full p-1 z-10 sm:text-sm">
                                <div className="p-2 hover:bg-orange-100 cursor-pointer transition-colors duration-200" onClick={() => handleFilter('all')}>All</div>
                                <div className="p-2 hover:bg-green-100 cursor-pointer transition-colors duration-200" onClick={() => handleFilter('correct')}>Correct</div>
                                <div className="p-2 hover:bg-red-100 cursor-pointer transition-colors duration-200" onClick={() => handleFilter('incorrect')}>Incorrect</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}; 