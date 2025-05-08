"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ProtectedPage from '@/components/ProtectPage';
import { useUser } from '@/hooks/useUser';
import { Role_type } from '@/config/role';
import { Subject } from '@/types/api/Subject';
import { BackendRoutes } from '@/config/apiRoutes';
import { LoaderIcon, XCircleIcon } from "lucide-react";
import Button from '@/components/ui/Button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { PencilIcon, XIcon } from "lucide-react";

const fetchSubject = async (): Promise<Array<Subject>> => {
    const response = await axios.get(BackendRoutes.SUBJECT);
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error("Failed to fetch dentists data");
};

const Main = () => {
    const {
        data: subject = [],
        isLoading,
        isError,
      } = useQuery({
        queryKey: ["subject"],
        queryFn: fetchSubject,
      });
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [existingImg, setExistingImg] = useState<string | null>(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const { data: session } = useSession();
    const [showModal, setShowModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: null as File | null, // Add image
    });
    const admin = user?.role == Role_type.SADMIN;

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
          if (!session?.user.token) throw new Error("Authentication required");
          await axios.delete(`${BackendRoutes.SUBJECT}/${id}`, {
            headers: { Authorization: `Bearer ${session.user.token}` },
          });
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["subject"] });
        },
        onError: (error: Error) => {
          setError(error.message);
        },
    });

    const editMutation = useMutation({
      mutationFn: async ({ id, updatedData }: { id: string; updatedData: Partial<Subject> }) => {
        if (!session?.user.token) throw new Error("Authentication required");
    
        const formData = new FormData();
        if (updatedData.name) formData.append("name", updatedData.name);
        if (updatedData.description) formData.append("description", updatedData.description);
    
        // Only append image if a new image is uploaded
        if (
          updatedData.img &&
          typeof updatedData.img === "object" &&
          "name" in updatedData.img
        ) {
          formData.append("image", updatedData.img as File);
        } else if (updatedData.img) {
          // If no new image is uploaded, send the existing image
          formData.append("image", updatedData.img as string); // It could be an image URL or existing image path
        }
    
        const response = await axios.put(`${BackendRoutes.SUBJECT}/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
            "Content-Type": "multipart/form-data",
          },
        });
    
        return response.data.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["subject"] });
        toast.success("Subject updated successfully!");
        setEditModal(false); // Close the modal on success
      },
      onError: (error: AxiosError) => {
        toast.error(`Update failed: ${error.message}`);
      },
    });    

    const createMutation = useMutation({
      mutationFn: async (newSubject: Omit<Subject, "_id"|"createAt">) => {
        if (!session?.user.token) throw new Error("Authentication required");
    
        const formDataPayload = new FormData();
        formDataPayload.append("name", newSubject.name);
        formDataPayload.append("description", newSubject.description);
         // Ensure image is added correctly as file, only if it's not null
        if (newSubject.img) {
          formDataPayload.append("image", newSubject.img); // img is now a File
        }
    
        const response = await axios.post(BackendRoutes.SUBJECT, formDataPayload, {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
            "Content-Type": "multipart/form-data",
          },
        });
    
        return response.data.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["subject"] });
        setShowModal(false);
        resetForm();
      },
      onError: (error: AxiosError) => {
        setError(error.message);
      },
    });
    // Reset form function
    const resetForm = () => {
      setFormData({
        name: "",
        description: "",
        image: null,
      });
    };
      
    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value, type } = e.target;
    
      if (type === "file") {
        const fileInput = e.target as HTMLInputElement;
        const selectedFile = fileInput.files?.[0];
    
        // Optional: Validate the file type (for example, only allow image files)
        if (selectedFile && !selectedFile.type.startsWith("image/")) {
          setError("Please upload a valid image file.");
          return;
        }
    
        // If validation passes, set the file
        setFormData((prev) => ({
          ...prev,
          image: selectedFile || null,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
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
    
      if (!formData.image) {
        setError("Image is required");
        return false;
      }
    
      return true;
    };
      
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
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

        createMutation.mutate({
          name: formData.name,
          description: formData.description,
          img: formData.image //error but it works so dont touch it
        });
      };
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
    
      // If no new image is selected, use the existing image (existingImg)
      editMutation.mutate({
        id: selectedSubjectId,
        updatedData: {
          name: formData.name,
          description: formData.description,
          img: formData.image || existingImg || "" // error but it works so dont touch it
        }
      });
    };    
    
    const handleEditClick = (subject: Subject) => {
      setFormData({
        name: subject.name,
        description: subject.description,
        image: null, // only if user uploads new one
      });
      setExistingImg(`http://localhost:5000${subject.img}`); // set the current image path
      setSelectedSubjectId(subject._id); // Set the selected subject ID
      setEditModal(true); // Open the edit modal
    };    
    
    return (
        <ProtectedPage>
            <Navbar/>
            <div className="container mx-auto p-4 pt-20 mt-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Subjects</h1>
                    {admin? (<Button textButton="Add subject" className='bg-red-500 hover:bg-red-800' onClick={() => setShowModal(true)}/>):null}
                    
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-sm:mt-4">
                  {subject.map((subject) => (
                    <div key={subject._id} className="relative bg-white shadow-xl rounded-lg p-4 hover:bg-gray-100 hover:shadow-xl transition duration-300 ease-in-out">
                      <Link href={`/main/${subject._id}`}>
                        <div className="relative w-full h-48">
                          <Image
                            src={`http://localhost:5000${subject.img}`}
                            alt={subject.name}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-lg"
                          />
                        </div>
                        <h2 className="text-xl font-semibold mt-2">{subject.name}</h2>
                        <p className="text-gray-600">{subject.description}</p>
                      </Link>

                      {/* Edit/Delete Icons */}
                      {admin? (
                        <div className="absolute bottom-2 right-2 flex gap-2">
                          <button
                            onClick={() => handleEditClick(subject)}
                            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            <PencilIcon size={16} />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(subject._id)}
                            disabled={deleteMutation.isPending}
                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <XIcon size={16} />
                          </button>
                        </div>) : null}
                    </div>
                  ))}
                </div>
            </div>
            <Dialog
              open={showModal}
              onOpenChange={(open) => {
                setShowModal(open);
                if (!open) {
                  resetForm();
                  setError(null); // Reset error state when closing modal
                }
              }}
            >
              <DialogContent className="sm:max-w-md [&>button:last-child]:hidden">
                <DialogHeader>
                  <DialogTitle>Subject</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit}
                  className="w-full space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Name Input */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Biology"
                    />
                    {error && error.includes('name') && (
                      <p className="text-red-500 text-sm">Name is required.</p>
                    )}
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Everything about Biology"
                    />
                    {error && error.includes('description') && (
                      <p className="text-red-500 text-sm">Description is required.</p>
                    )}
                  </div>

                  {/* Image Upload (Optional) */}
                  <div>
                    <label htmlFor="image" className="mb-1 block text-sm font-semibold">
                      Upload Image (Optional)
                    </label>
                    <input
                      type="file"
                      name="image"
                      id="image"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                    {formData.image && (
                      <p className="text-sm text-gray-600">Selected: {formData.image.name}</p>
                    )}
                    {!formData.image && existingImg && ( 
                      <div className="mt-2">
                        <Image
                          src={existingImg}
                          alt="Existing Image"
                          width={0}
                          height={0}
                          className="rounded-lg"
                        />
                        <p className="text-sm text-gray-500 mt-2">Current Image</p>
                      </div>
                    )}
                    {error && error.includes('image') && (
                      <p className="text-red-500 text-sm">Please upload a valid image.</p>
                    )}
                  </div>
                  {/* Submit Button */}
                  <DialogFooter className="flex justify-between pt-4">
                    <Button
                      textButton="Submit"
                      disabled={createMutation.isPending}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {createMutation.isPending ? (
                        <>
                          <LoaderIcon className="mr-2 inline animate-spin" size={16} />
                          Saving...
                        </>
                      ) : (
                        "Save Subject"
                      )}
                    </Button>

                    {/* Cancel Button */}
                    <DialogClose asChild>
                      <Button
                        textButton="Cancel"
                        className="bg-red-500 hover:bg-red-800"
                        onClick={resetForm}
                      />
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog
              open={editModal}
              onOpenChange={(open) => {
                setEditModal(open);
                if (!open) {
                  resetForm();
                  setError(null);
                }
              }}
            >
              <DialogContent className="sm:max-w-md [&>button:last-child]:hidden">
                <DialogHeader>
                  <DialogTitle>Edit Subject</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleEditSubmit}
                  className="w-full space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Name */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label htmlFor="image" className="mb-1 block text-sm font-semibold">
                      Upload New Image (optional)
                    </label>
                    <input
                      type="file"
                      name="image"
                      id="image"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                    {formData.image instanceof File && (
                      <p className="text-sm text-gray-600">Selected: {formData.image.name}</p>
                    )}
                    {!formData.image && existingImg && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src={existingImg.startsWith("http") ? existingImg : `http://localhost:5000${existingImg}`}
                          alt="Subject Image"
                          fill
                          style={{ objectFit: "cover" }}
                          className="rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <DialogFooter className="flex justify-between pt-4">
                    <Button
                      textButton="Update"
                      disabled={editMutation.isPending}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {editMutation.isPending ? (
                        <>
                          <LoaderIcon className="mr-2 inline animate-spin" size={16} />
                          Updating...
                        </>
                      ) : (
                        "Update Subject"
                      )}
                    </Button>

                    <DialogClose asChild>
                      <Button
                        textButton="Cancel"
                        className="bg-red-500 hover:bg-red-800"
                        onClick={resetForm}
                      />
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </ProtectedPage>
    );
};

export default Main;