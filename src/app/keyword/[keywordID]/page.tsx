"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FrontendRoutes, BackendRoutes } from '../../../config/apiRoutes';
import { useSession } from 'next-auth/react';
import ProtectedPage from '../../../components/ProtectPage';
import { Keyword } from '../../../types/api/Keyword';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import Link from 'next/link';
import { IoIosArrowBack } from "react-icons/io";
import AddKeywordReportModal from '../../../components/Report/AddKeywordReportModal';
import { useUser } from '../../../hooks/User/useUser';
import { Role_type } from '../../../config/role';

const KeywordDetail = () => {
    const params = useParams();
    const keywordID = params.keywordID;
    const { user } = useUser();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [keyword, setKeyword] = useState<Keyword | null>(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const isAdmin = user?.role === Role_type.ADMIN || user?.role === Role_type.SADMIN;

    useEffect(() => {
        const fetchKeyword = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(
                    BackendRoutes.KEYWORD_BY_ID.replace(":keywordID", String(keywordID)),
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${session?.user.token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch keyword");
                }

                const data = await response.json();
                setKeyword(data.data);
                console.log("Keyword data:", data.data);
            } catch (error) {
                setError(`${error}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchKeyword();
    }, [keywordID, session?.user.token]);

    if (isLoading) {
        return <p>Loading...</p>;
    }
    if (error) {
        return <p>Error: {error}</p>;
    }
    return (
        <ProtectedPage>
            <div className="mx-auto p-4 mt-20 justify-center items-center flex flex-col">
                <div className="absolute top-23 md:top-25 left-8 md:left-15 text-lg">
                    <Link href={FrontendRoutes.KEYWORD}>
                        <button className="group flex items-center gap-2 px-4 py-2.5 bg-gray-300/20 backdrop-blur-md border border-white/30 hover:bg-orange-400 hover:text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out font-medium hover:scale-105 active:scale-95">
                            <IoIosArrowBack className="text-xl group-hover:-translate-x-1 transition-transform duration-300" />
                            <span>Back to Keywords</span>
                        </button>
                    </Link>
                </div>
                <h1 className="text-2xl font-bold mb-4">Keyword Detail</h1>
                <Card className="mt-6 p-6 bg-white shadow-lg rounded-xl relative w-full max-w-3xl">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                {keyword?.isGlobal ? (
                                    <>
                                        <p className="text-sm text-gray-500">Type</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-base md:text-lg font-medium text-blue-600">Global Keyword</p>
                                            <Badge className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                                                Global
                                            </Badge>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-500">Subject</p>
                                        <p className="text-base md:text-lg font-medium text-gray-900">{keyword?.subject?.name}</p>
                                    </>
                                )}
                            </div>
                            {(isAdmin &&
                                <Badge
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                                        keyword?.status === "approved"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                        : keyword?.status === "pending"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                                        : keyword?.status === "reported"
                                        ? "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                                        : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                                    }`}
                                >
                                    {keyword?.status === "approved" 
                                        ? "Approved" 
                                        : keyword?.status === "pending"
                                        ? "Pending"
                                        : keyword?.status === "reported"
                                        ? "Reported"
                                        : "Rejected"}
                                </Badge>
                            )}
                        </div>
                        {!keyword?.isGlobal && (
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">Category</p>
                                <p className="text-base md:text-lg font-medium text-gray-900">{keyword?.category?.category}</p>
                            </div>
                        )}
                        {keyword?.status !== 'pending' && keyword?.status !== 'reported' && (
                            <button
                                className="mt-4 w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center gap-2"
                                onClick={() => setShowReportModal(true)}
                            >
                                Report Keyword
                            </button>
                        )}
                    </div>
                </Card>
                <Card className="mt-6 p-6 bg-white shadow-lg rounded-xl relative w-full max-w-3xl">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="text-base md:text-lg font-medium text-gray-900">{keyword?.name}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Keywords</p>
                            <div className="space-y-2">
                                {keyword?.keywords?.map((kw, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
                                        <span className="text-base text-gray-900">{kw}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {showReportModal && keyword && (
                <AddKeywordReportModal
                    showModal={showReportModal}
                    setShowModal={setShowReportModal}
                    originalKeyword={keyword}
                    userProp={user}
                />
            )}
        </ProtectedPage>
    );
};

export default KeywordDetail; 