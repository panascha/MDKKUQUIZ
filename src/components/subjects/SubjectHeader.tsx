import Button from '@/components/ui/Button';
import { YearFilter } from './YearFilter';

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
            <h1 className="text-4xl font-extrabold text-sky-800">Subjects</h1>

            {isAdmin && (
                <Button
                    textButton="Add Subject"
                    className="bg-sky-600 hover:bg-sky-800 mt-2 py-2 px-5 rounded-xl text-white font-semibold shadow-md transition-all"
                    onClick={onAddClick}
                />
            )}
            
            <YearFilter selectedYear={selectedYear} onYearChange={onYearChange} />
        </div>
    );
}; 