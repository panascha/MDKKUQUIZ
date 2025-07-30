import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import { FrontendRoutes } from "../../../config/apiRoutes";

export const BackButton = () => {
    const router = useRouter();
    
    return (
        <div className="flex items-start">
            <button 
                onClick={() => router.push(FrontendRoutes.HOMEPAGE)} 
                className="group flex items-center gap-2 px-4 py-2.5 bg-gray-300/20 backdrop-blur-md border border-white/30 hover:bg-orange-400 hover:text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out font-medium hover:scale-105 active:scale-95"
            >
                <IoIosArrowBack className="text-xl group-hover:-translate-x-1 transition-transform duration-300" />
                <span>Back to Home Page</span>
            </button>
        </div>
    );
}; 