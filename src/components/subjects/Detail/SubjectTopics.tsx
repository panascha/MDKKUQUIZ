import { Category } from "@/types/api/Category";
import { Subject } from "@/types/api/Subject";
import { useState } from "react";
import EditCategoryModal from "@/components/category/EditCategoryModal";
import { useDeleteCategory } from "@/hooks/category/useDeleteCategory";
import { PencilIcon, TrashIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { Role_type } from "@/config/role";

interface SubjectTopicsProps {
    categories: Category[];
    subject: Subject;
}

export default function SubjectTopics({ categories, subject }: SubjectTopicsProps) {
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const { mutate: deleteCategory } = useDeleteCategory();
    const { user } = useUser();
    const isAdmin = user?.role === Role_type.ADMIN || user?.role === Role_type.SADMIN;

    const handleDelete = (categoryId: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            deleteCategory(categoryId, {
                onSuccess: () => {
                    toast.success('Category deleted successfully');
                },
                onError: (error) => {
                    toast.error(error.message || 'Failed to delete category');
                }
            });
        }
    };

    return (
        <div className="space-y-4">
            {categories.map((category) => (
                <div key={category._id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                            <p className="text-gray-600 mt-1">{category.description}</p>
                        </div>
                        {isAdmin && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingCategory(category)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="Edit category"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(category._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete category"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {editingCategory && (
                <EditCategoryModal
                    showModal={!!editingCategory}
                    setShowModal={() => setEditingCategory(null)}
                    subject={subject}
                    category={editingCategory}
                />
            )}
        </div>
    );
} 