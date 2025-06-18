import { YearFilter } from './YearFilter';
import { PlusIcon } from '@heroicons/react/24/outline';

interface SubjectHeaderProps {
    isAdmin: boolean;
    onAddClick: () => void;
    selectedYear: number | null;
    onYearChange: (year: number | null) => void;
}

export const SubjectHeader = ({
    isAdmin,
    onAddClick,
    selectedYear,
    onYearChange
}: SubjectHeaderProps) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <h1 className="text-4xl font-extrabold text-sky-800">Subjects</h1>
                {isAdmin && (
                    <button
                        onClick={onAddClick}
                        className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-full transition-colors shadow-md hover:shadow-lg"
                        title="Add subject"
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
            <YearFilter selectedYear={selectedYear} onYearChange={onYearChange} />
        </div>
    );
}; 