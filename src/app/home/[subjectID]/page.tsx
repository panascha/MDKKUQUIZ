"use client"

import { useGetSubjectByID } from "../../../hooks/subject/useGetSubjectByID";
import { useGetCategoryBySubjectID } from "../../../hooks/category/useGetCategoryBySubjectID";
import { BackButton } from "../../../components/subjects/Detail/BackButton";
import { SubjectDetailHeader } from "../../../components/subjects/Detail/SubjectDetailHeader";
import { SubjectActions } from "../../../components/subjects/Detail/SubjectActions";
import { useQuery } from "@tanstack/react-query";
import { useState } from 'react';
import AddCategoryModal from "../../../components/category/AddCategoryModal";
import { useUser } from '../../../hooks/User/useUser';
import { Role_type } from '../../../config/role';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';
import SubjectTopics from '../../../components/subjects/Detail/SubjectTopics';
import { useGetUserStatById } from '../../../hooks/stats/useGetUserStatById';

export default function SubjectDetailPage() {
    const params = useParams();
    const subjectID = typeof params.subjectID === 'string' ? params.subjectID : '';
    const { user } = useUser();
    const isSAdmin = user?.role === Role_type.SADMIN;
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

    const { data: userStat } = useGetUserStatById(user?._id || '', subjectID, !!user?._id && !!subjectID);
    const canTakeQuiz = isSAdmin || (userStat?.quizCount ?? 0) >= 4 || userStat?.allKeywordsUsed;

    const { data: subject, isLoading, error } = useQuery({
        queryKey: ["subject", subjectID],
        queryFn: () => useGetSubjectByID(subjectID),
        enabled: !!subjectID
    });

    const { data: categories = [], isLoading: isCategoryLoading, error: categoryError } = useGetCategoryBySubjectID(subjectID);

    if (isLoading || isCategoryLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || categoryError || !subject?.name) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600">
                        {error?.message || categoryError?.message || "Failed to load subject details"}
                    </p>
                </div>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <BackButton />
                    <SubjectDetailHeader subject={subject} />
                    <div className="mt-8 text-center">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Categories Available</h2>
                        <p className="text-gray-500 mb-4">There are no categories for this subject yet.</p>
                        {isSAdmin && (
                            <button
                                onClick={() => setShowAddCategoryModal(true)}
                                className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-full transition-colors shadow-md hover:shadow-lg"
                                title="Add category"
                            >
                                <PlusIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
                <AddCategoryModal
                    showModal={showAddCategoryModal}
                    setShowModal={setShowAddCategoryModal}
                    subject={subject}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Fixed Back Button at Top with Glassmorphism */}
            <div className="sticky top-0 z-50 pt-2">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <BackButton />
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-4">
                <SubjectDetailHeader subject={subject}/>
                <SubjectActions subjectId={subjectID} canTakeQuiz={canTakeQuiz} isSAdmin={isSAdmin} />
                <div className="flex justify-between items-start gap-4 mt-6">
                    <div className="flex-1">
                        <SubjectTopics categories={categories} subject={subject} />
                    </div>
                    {isSAdmin && (
                        <button
                            onClick={() => setShowAddCategoryModal(true)}
                            className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-full transition-colors shadow-md hover:shadow-lg"
                            title="Add category"
                        >
                            <PlusIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>
            <AddCategoryModal
                showModal={showAddCategoryModal}
                setShowModal={setShowAddCategoryModal}
                subject={subject}
            />
        </div>
    );
}