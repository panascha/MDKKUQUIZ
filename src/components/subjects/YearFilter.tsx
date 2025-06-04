import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';

interface YearFilterProps {
    selectedYear: number | null;
    onYearChange: (year: number | null) => void;
}

export const YearFilter = ({ selectedYear, onYearChange }: YearFilterProps) => {
    return (
        <div className="ml-auto mt-2">
            <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer hover:bg-sky-100 text-gray-700 font-medium rounded-lg p-2 transition-transform hover:scale-105 border border-gray-300 shadow-sm">
                    {selectedYear ? `Year ${selectedYear}` : "All Year"}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white w-48">
                    <DropdownMenuItem
                        onClick={() => onYearChange(null)}
                        className="hover:bg-gray-100 cursor-pointer"
                    >
                        All Years
                    </DropdownMenuItem>
                    {[1, 2, 3, 4, 5, 6].map((year) => (
                        <DropdownMenuItem
                            key={year}
                            onClick={() => onYearChange(year)}
                            className="hover:bg-gray-100 cursor-pointer"
                        >
                            Year {year}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}; 