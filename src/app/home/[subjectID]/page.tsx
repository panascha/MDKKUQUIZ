"use client"

import { useGetSubjectByID } from "@/hooks/subject/useGetSubjectByID";
import { useGetCategoryBySubjectID } from "@/hooks/category/useGetCategoryBySubjectID";
import { BackButton } from "@/components/subjects/Detail/BackButton";
import { SubjectDetailHeader } from "@/components/subjects/Detail/SubjectDetailHeader";
import { SubjectActions } from "@/components/subjects/Detail/SubjectActions";
import { SubjectTopics } from "@/components/subjects/Detail/SubjectTopics";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@/types/api/Category";
import { use } from 'react';

export default function SubjectDetailPage({
    params,
}: {
    params: Promise<{ subjectID: string }>;
}) {
    const { subjectID } = use(params);

    const { data: subject, isLoading, error } = useQuery({
        queryKey: ["subject", subjectID],
        queryFn: () => useGetSubjectByID(subjectID),
        enabled: !!subjectID
    });

    const getCategoryFn = useGetCategoryBySubjectID(subjectID);
    const { data: categories, isLoading: isCategoryLoading, error: categoryError } = useQuery<Category[]>({
        queryKey: ["categories", subjectID],
        queryFn: getCategoryFn,
        enabled: !!subjectID
    });

    if (isLoading || isCategoryLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || categoryError || !subject || !categories) {
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <BackButton />
                <SubjectDetailHeader subject={subject} />
                <SubjectActions subjectId={subjectID} />
                <SubjectTopics categories={categories} />
            </div>
        </div>
    );
}