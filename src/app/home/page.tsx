"use client"
import React, { useState } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProtectedPage from '../../components/ProtectPage';
import { useUser } from '../../hooks/useUser';
import { Role_type } from '../../config/role';
import { Subject } from '../../types/api/Subject';
import { LoaderIcon, XCircleIcon } from "lucide-react";
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useCreateSubject } from '../../hooks/subject/useCreateSubject';
import { useUpdateSubject } from '../../hooks/subject/useUpdateSubject';
import { useDeleteSubject } from '../../hooks/subject/useDeleteSubject';
import { useGetSubject } from '../../hooks/subject/useGetSubject';
import { SubjectCard } from '../../components/subjects/SubjectCard';
import { SubjectHeader } from '../../components/subjects/SubjectHeader';
import AddSubjectModal from '../../components/subjects/Modal/AddSubjectModal';
import EditSubjectModal from '../../components/subjects/Modal/EditSubjectModal';
import { BACKEND_URL } from '../../config/apiRoutes';

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
        img: formData.image as unknown as string,
        Category: [],
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
          Category: []
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
        image: null,
      });
      setExistingImg(`${BACKEND_URL}${subject.img}`);
      setSelectedSubjectId(subject._id);
      setEditModal(true);
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
        <div className="container mx-auto px-4 py-8">
          <SubjectHeader
            isAdmin={admin}
            onAddClick={() => setShowModal(true)}
            selectedYear={year}
            onYearChange={setYear}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filterSubject.map((subject) => (
              <SubjectCard
                key={subject._id}
                subject={subject}
                isAdmin={admin}
                onEdit={handleEditClick}
                onDelete={(id) => deleteSubject.mutate(id, {
                  onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["subject"] });
                    toast.success("delete succesfully!")
                  },
                  onError: (error: Error) => {
                    setError(error.message);
                  },
                })}
                isDeleting={deleteSubject.isPending}
              />
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