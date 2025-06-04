import { Category } from "@/types/api/Category";

interface SubjectTopicsProps {
    categories: Category[];
}

export const SubjectTopics = ({ categories }: SubjectTopicsProps) => {
    return (
        <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Topics Covered</h2>
            <ul className="space-y-3">
                {categories.map((category) => (
                    <li key={category._id} className="text-lg text-gray-700">
                        <strong className="font-semibold">{category.category}:</strong> {category.description}
                    </li>
                ))}
            </ul>
        </div>
    );
}; 