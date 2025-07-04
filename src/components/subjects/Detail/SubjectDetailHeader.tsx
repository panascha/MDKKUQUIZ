import { BACKEND_URL } from "../../../config/apiRoutes";
import { Subject } from "../../../types/api/Subject";
import Image from "next/image";

interface SubjectDetailHeaderProps {
    subject: Subject;
}

export const SubjectDetailHeader = ({ subject }: SubjectDetailHeaderProps) => {
    return (
        <div className="text-center mt-6">
            <h1 className="text-4xl font-extrabold mb-6">{subject.name}</h1>

            <div className="w-48 h-48 md:w-64 md:h-64 relative mx-auto rounded-full shadow-lg hover:scale-105 transition-transform duration-300 overflow-hidden cursor-pointer">
                <Image
                    src={`${BACKEND_URL}${subject.img}`}
                    alt={subject.name}
                    fill
                    className="object-cover rounded-full"
                />
            </div>

            <p className="text-lg text-gray-600 mt-4">{subject.description}</p>
        </div>
    );
}; 