import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import { FrontendRoutes } from "@/config/apiRoutes";

export const BackButton = () => {
    const router = useRouter();
    
    return (
        <div className="absolute top-23 md:top-25 left-8 md:left-15 text-lg">
            <button 
                onClick={() => router.push(FrontendRoutes.HOMEPAGE)} 
                className="flex items-center mb-4 hover:bg-orange-400 hover:text-white p-2 rounded-sm transition duration-300 ease-in-out hover:opacity-80 cursor-pointer"
            >
                <span className='flex items-center'>
                    <IoIosArrowBack className="text-xl" /> Back
                </span>
            </button>
        </div>
    );
}; 