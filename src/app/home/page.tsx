"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProtectedPage from '@/components/ProtectPage';
import { useUser } from '@/hooks/useUser';
import { Role_type } from '@/config/role';
import { Subject } from '@/types/api/Subject';
import { LoaderIcon, XCircleIcon } from "lucide-react";
import Button from '@/components/ui/Button';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { PencilIcon, XIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import AddSubjectModal from '@/components/subjects/AddSubjectModal';
import EditSubjectModal from '@/components/subjects/EditSubjectModal';
import { useCreateSubject } from '@/hooks/subject/useCreateSubject';
import { useUpdateSubject } from '@/hooks/subject/useUpdateSubject';
import { useDeleteSubject } from '@/hooks/subject/useDeleteSubject';
import { useGetSubject } from '@/hooks/subject/useGetSubject';
import { AxiosError } from 'axios';

const Main = () => {
    const {
        data: subject = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["subject"],
        queryFn: useGetSubject,
    });
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [existingImg, setExistingImg] = useState<string | null>(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const { data: session } = useSession();
    const [showModal, setShowModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [year, setYear] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: null as File | null,
        year: 1
    });
    const admin = user?.role == Role_type.SADMIN;
    const deleteSubject = useDeleteSubject();
    const editSubject = useUpdateSubject();   
    const createSubject = useCreateSubject();

    // Reset form function
    const resetForm = () => {
      setFormData({
        name: "",
        description: "",
        image: null,
        year: 1,
      });
    };
      
    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value, type } = e.target;
    
      if (type === "file") {
        const fileInput = e.target as HTMLInputElement;
        const selectedFile = fileInput.files?.[0];
    
        if (selectedFile && !selectedFile.type.startsWith("image/")) {
          setError("Please upload a valid image file.");
          return;
        }
    
        setFormData((prev) => ({
          ...prev,
          image: selectedFile || null,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: name === "year" ? Math.max(1, Math.min(6, parseInt(value, 10))) : value,
        }));
      }
    };
    
    const validateForm = () => {
      setError("");
    
      if (!formData.name.trim()) {
        setError("Name is required");
        return false;
      }
    
      if (!formData.description.trim()) {
        setError("Description is required");
        return false;
      }
    
      if (!formData.year || formData.year < 1 || formData.year > 6) {
        setError("Year must be between 1 and 6");
        return false;
      }
    
      if (!formData.image) {
        setError("Image is required");
        return false;
      }
      return true;
    };
    
    const handleSubmit = (e: React.FormEvent) => {

      e.preventDefault();

      if (!validateForm()) {
        toast.error("Form Error");
        return;
      }

      if (!user) {
        toast.error("Login First");
        return;
      }

      if (!formData.name || !formData.description) {
        toast.error("Name and description are required.");
        return;
      }
      createSubject.mutate({
        name: formData.name,
        description: formData.description,
        year: formData.year,
        img: formData.image as unknown as string, // Type assertion for File to string
        Category: [] // Add empty Category array as it's required by the type
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["subject"] });
          setShowModal(false);
          toast.success("Subject create successfully!");
          resetForm();
        },
        onError: (error: Error) => {
          console.log(error.message);
          setError(error.message);
        } 
      });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
      e.preventDefault();
    
      if (!user) {
        toast.error("Login First");
        return;
      }
    
      if (!selectedSubjectId) {
        toast.error("No subject selected for editing.");
        return;
      }
    
      editSubject.mutate({
        id: selectedSubjectId,
        updatedData: {
          name: formData.name,
          description: formData.description,
          year: formData.year,
          img: formData.image ? (formData.image as unknown as string) : existingImg || "",
          Category: [] // Add empty Category array as it's required by the type
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["subject"] });
          toast.success("Subject updated successfully!");
          setEditModal(false);
        },
        onError: (error: Error) => {
          toast.error(`Update failed: ${error.message}`);
        },
      });
    };    
    
    const handleEditClick = (subject: Subject) => {
      setFormData({
        name: subject.name,
        description: subject.description,
        year: subject.year,
        image: null, // only if user uploads new one
      });
      setExistingImg(`http://localhost:5000${subject.img}`); // set the current image path
      setSelectedSubjectId(subject._id); // Set the selected subject ID
      setEditModal(true); // Open the edit modal
    };    
    
    const filterSubject = subject.filter((item) => {
      if (year === null || year === undefined) return true;
      return item.year === year;
    });

    if (error)
      return (
        <p className="text-red-500 flex items-center gap-2 pt-4">
          <XCircleIcon className="w-5 h-5" />
          Error: {error}
        </p>
      );

    if (isLoading)
      return (
        <p className="flex items-center justify-center gap-3 pt-10">
          <LoaderIcon /> Loading...
        </p>
      );

    return (
      <ProtectedPage>
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h1 className="text-4xl font-extrabold text-sky-800">Subjects</h1>

            {admin ? (
              <Button
                textButton="Add Subject"
                className="bg-sky-600 hover:bg-sky-800 mt-2 py-2 px-5 rounded-xl text-white font-semibold shadow-md transition-all"
                onClick={() => setShowModal(true)}
              />
            ) : null}
            {/* Push the dropdown to the far right */}
            <div className="ml-auto mt-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer hover:bg-sky-100 text-gray-700 font-medium rounded-lg p-2 transition-transform hover:scale-105 border border-gray-300 shadow-sm">
                  {year ? `Year ${year}` : "All Year"}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white w-48">
                  <DropdownMenuItem
                    onClick={() => setYear(null)}
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    All Years
                  </DropdownMenuItem>
                  {[1, 2, 3, 4, 5, 6].map((year) => (
                    <DropdownMenuItem
                      key={year}
                      onClick={() => setYear(year)}
                      className="hover:bg-gray-100 cursor-pointer"
                    >
                      Year {year}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filterSubject.map((subject) => (
              <div
                key={subject._id}
                className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] overflow-hidden"
              >
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
                {admin && (
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleEditClick(subject)}
                      className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      onClick={() => deleteSubject.mutate(subject._id,  
                        {
                          onSuccess: () => {
                            queryClient.invalidateQueries({ queryKey: ["subject"] });
                            toast.success("delete succesfully!")
                          },
                          onError: (error: Error) => {
                            setError(error.message);
                          },
                        }
                      )}
                      disabled={deleteSubject.isPending}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Subject Modal */}
        <AddSubjectModal
          showModal={showModal}
          setShowModal={setShowModal}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          error={error}
          createMutation={createSubject}
        />

        {/* Edit Subject Modal */}
        <EditSubjectModal
          editModal={editModal}
          setEditModal={setEditModal}
          formData={formData}
          handleInputChange={handleInputChange}
          handleEditSubmit={handleEditSubmit}
          resetForm={resetForm}
          error={error}
          editMutation={editSubject}
          existingImg={existingImg}
        />
      </ProtectedPage>
    );
};

export default Main;