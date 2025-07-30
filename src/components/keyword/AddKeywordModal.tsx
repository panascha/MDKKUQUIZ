import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../ui/Dialog';
import Button from '../ui/Button';
import { LoaderIcon, X } from "lucide-react";
import { UserProps } from '../../types/api/UserProps';
import { Category } from '../../types/api/Category';
import { Subject } from '../../types/api/Subject';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu';
import { CreateKeywordData, useCreateKeyword } from '../../hooks/keyword/useCreateKeyword';
import { useUser } from '../../hooks/User/useUser';
import toast from 'react-hot-toast';
import { Role_type } from '../../config/role';

interface AddKeywordModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  userProp: UserProps;
  subject: Subject[];
  category: Category[];
}

const AddKeywordModal: React.FC<AddKeywordModalProps> = ({
  showModal,
  setShowModal,
  userProp,
  subject,
  category
}) => {
  const [formData, setFormData] = useState<CreateKeywordData>({
    user: userProp._id,
    name: '',
    subject: '',
    category: '',
    keywords: [''],
    status: 'pending' as const,
    isGlobal: false,
  });

  const [error, setError] = useState<string | null>(null);
  const createKeywordMutation = useCreateKeyword();
  const { user } = useUser();
    const isSAdmin = user?.role === Role_type.SADMIN;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKeywordsChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.map((keyword, i) => i === index ? value : keyword)
    }));
  };

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      user: userProp._id,
      name: '',
      subject: '',
      category: '',
      keywords: [''],
      status: 'pending' as const,
      isGlobal: false,
    });
    setError(null);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Keyword name is required');
      return;
    }
    if (!formData.isGlobal && !formData.subject) {
      setError('Subject is required for non-global keywords');
      return;
    }
    if (!formData.isGlobal && !formData.category) {
      setError('Category is required for non-global keywords');
      return;
    }
    if (!formData.keywords.some(kw => kw.trim())) {
      setError('At least one keyword is required');
      return;
    }

    if (!user._id) {
      return toast.error("There is no user ID");
    }

    try {
      // Filter out empty keywords and trim all keywords
      const filteredKeywords = formData.keywords
        .filter(kw => kw.trim())
        .map(kw => kw.trim());
      
      const keywordData: CreateKeywordData = {
        user: user._id,
        name: formData.name.trim(),
        keywords: filteredKeywords,
        status: 'pending',
        isGlobal: formData.isGlobal,
        ...(formData.isGlobal ? {} : {
          subject: formData.subject,
          category: formData.category
        })
      };
      
      await createKeywordMutation.mutateAsync(keywordData);
      toast.success("Keyword created successfully");
      resetForm();
    } catch (error: any) {
      console.error('Error creating keyword:', error);
      setError(error.response?.data?.message || 'Failed to create keyword. Please try again.');
    }
  };

  return (
    <Dialog
      open={showModal}
      onOpenChange={(open) => {
        setShowModal(open);
        if (!open) {
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-md md:max-w-lg [&>button:last-child]:hidden max-h-[90vh] overflow-y-auto mt-8 flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Keyword</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {isSAdmin && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isGlobal"
                checked={formData.isGlobal}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  isGlobal: e.target.checked,
                  subject: e.target.checked ? '' : prev.subject,
                  category: e.target.checked ? '' : prev.category
                }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isGlobal" className="text-sm font-medium text-gray-700">
                global keyword (available across all subjects and categories)
              </label>
            </div>
          )}

          {/* Subject Selection */}
          {!formData.isGlobal && (
          <div>
            <label className="mb-1 block text-sm font-semibold">Subject *</label>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full text-left hover:bg-gray-200 border border-gray-300 rounded-md p-2 transition duration-300 ease-in-out cursor-pointer">
                {formData.subject ? subject.find(s => s._id === formData.subject)?.name : 'Select Subject'}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full bg-white">
                {subject.map((s) => (
                  <DropdownMenuItem
                    key={s._id}
                    className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        subject: s._id,
                        category: '' // Reset category when subject changes
                      }));
                    }}
                  >
                    {s.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          )}

          {/* Category Selection */}
          {!formData.isGlobal && (
          <div>
            <label className="mb-1 block text-sm font-semibold">Category *</label>
            <DropdownMenu>
              <DropdownMenuTrigger 
                className={`w-full text-left hover:bg-gray-200 border border-gray-300 rounded-md p-2 transition duration-300 ease-in-out cursor-pointer ${
                  !formData.subject ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!formData.subject}
              >
                {!formData.subject 
                  ? 'Select Subject First' 
                  : formData.category 
                    ? category.find(c => c._id === formData.category)?.category 
                    : 'Select Category'}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full bg-white">
                {formData.subject && (
                  <>
                    {category
                      .filter(c => c.subject._id === formData.subject)
                      .map((c) => (
                  <DropdownMenuItem
                    key={c._id}
                    className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                    onClick={() => setFormData(prev => ({ ...prev, category: c._id }))}
                  >
                    {c.category}
                  </DropdownMenuItem>
                ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          )}

          {/* Keyword Name */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Keyword Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="Enter keyword name"
            />
          </div>

          {/* Keywords List */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Keywords *</label>
            {formData.keywords.map((keyword, index) => (
                <div key={index} className="mb-2 flex items-center">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => handleKeywordsChange(index, e.target.value)}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder={`Keyword ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeKeyword(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors ml-2"
                  title="Remove keyword"
                  disabled={formData.keywords.length <= 1}
                >
                  <X className="w-5 h-5" />
                </button>
                </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, keywords: [...prev.keywords, ''] }))}
              className="mt-2 text-sm text-blue-500 hover:text-blue-700"
            >
              + Add Keyword
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Buttons */}
          <DialogFooter className="flex justify-between pt-4">
            <Button
              textButton="Submit"
              disabled={createKeywordMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {createKeywordMutation.isPending ? (
                <>
                  <LoaderIcon className="mr-2 inline animate-spin" size={16} />
                  Submitting...
                </>
              ) : (
                "Submit"
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
  );
};

export default AddKeywordModal; 