import { Subject } from '@/types/api/Subject';
import Image from 'next/image';
import Link from 'next/link';
import { PencilIcon, XIcon } from "lucide-react";
import { Role_type } from '@/config/role';

interface SubjectCardProps {
    subject: Subject;
    isAdmin: boolean;
    onEdit: (subject: Subject) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

export const SubjectCard = ({
    subject,
    isAdmin,
    onEdit,
    onDelete,
    isDeleting
}: SubjectCardProps) => {
    return (
        <div className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] overflow-hidden">
            <Link href={`/home/${subject._id}`} className="block p-4 pb-10">
                {/* Image */}
                <div className="relative w-full h-48 rounded-xl overflow-hidden">
                    <Image
                        src={`http://localhost:5000${subject.img}`}
                        alt={subject.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-xl transition-transform duration-300 hover:scale-105"
                    />
                </div>

                {/* Name */}
                <h2 className="text-lg font-semibold mt-4 text-sky-700 truncate">
                    {subject.name}
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {subject.description}
                </p>
            </Link>

            {/* Footer Left - Year */}
            <div className="absolute bottom-4 left-4 text-gray-500 text-sm font-medium">
                Year {subject.year}
            </div>

            {/* Footer Right - Admin Buttons */}
            {isAdmin && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                        onClick={() => onEdit(subject)}
                        className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        <PencilIcon size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(subject._id)}
                        disabled={isDeleting}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        <XIcon size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}; 