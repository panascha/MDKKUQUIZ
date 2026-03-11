import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../../ui/Dialog';
import Button from '../../ui/Button';
import { X, PlusIcon } from "lucide-react";
import { UserProps } from '../../../types/api/UserProps';
import { Category } from '../../../types/api/Category';
import { Subject } from '../../../types/api/Subject';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/DropdownMenu';
import { useUser } from '../../../hooks/User/useUser';
import toast from 'react-hot-toast';
import { CreateQuizData, useCreateQuiz } from '../../../hooks/quiz/useCreateQuiz';
import Image from 'next/image';
import { Keyword } from '../../../types/api/Keyword';
import { useGetKeyword } from '../../../hooks/keyword/useGetKeyword';
import { useGetQuizzes } from '../../../hooks/quiz/useGetQuizzes';
import { LoaderIcon } from 'lucide-react';
import { Quiz } from '../../../types/api/Quiz';
import { useImageGallery } from '../../../hooks/useImageGallery';
import heic2any from "heic2any";

interface AddQuizModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  userProp: UserProps;
  subject: Subject[];
  category: Category[];
}

function filterKeywords(keywords: string[], value: string) {
  if (!value.trim()) return keywords;
  
  const filtered = keywords.filter(k => k.toLowerCase().includes(value.toLowerCase()));
  
  // Maintain priority: exact matches first, then partial matches
  const exactMatches = filtered.filter(k => k.toLowerCase() === value.toLowerCase());
  const partialMatches = filtered.filter(k => k.toLowerCase() !== value.toLowerCase());
  
  return [...exactMatches, ...partialMatches];
}

const QUESTION_PATTERN_REGEX = /^(Identify|What\s+is|Which|Name|Explain|What)\b/i;

const isNotPattern = (word: string, isGlobal?: boolean) => {
  if (isGlobal && QUESTION_PATTERN_REGEX.test(word)) return false;
  return true;
};

const decodeHTML = (str: string) => {
  if (typeof document === 'undefined') return str;
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};

// Image Preview Gallery Component
const ImagePreviewGallery: React.FC<{
  imageFiles: File[];
  onRemoveImage: (index: number) => void;
}> = ({ imageFiles, onRemoveImage }) => {
  const imageUrls = imageFiles.map(file => URL.createObjectURL(file));
  
  const {
    currentIndex,
    isModalOpen,
    currentImage,
    hasMultipleImages,
    goToPrevious,
    goToNext,
    openModal,
    closeModal,
    setIsLoading,
    setImageError,
    setImageIndex
  } = useImageGallery({ 
    images: imageUrls,
    initialIndex: 0
  });

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setImageError(false);
  }, [setIsLoading, setImageError]);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setImageError(true);
  }, [setIsLoading, setImageError]);

  return (
    <>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
        {imageFiles.map((file, index) => (
          <div key={index} className="relative group">
            <div 
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                setImageIndex(index);
                openModal();
              }}
            >
              <Image
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              {/* Preview overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-2">
                  <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveImage(index);
              }}
              className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              title="Remove image"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <p className="mt-1 text-xs text-gray-600 truncate">{file.name}</p>
          </div>
        ))}
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center">
          <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            <Image
              src={currentImage}
              alt={`Preview ${currentIndex + 1} of ${imageFiles.length}`}
              className="max-w-full max-h-full object-contain"
              width={800}
              height={600}
              quality={95}
              priority
            />

            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              title="Close preview"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Navigation for multiple images */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
                  title="Previous image"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
                  title="Next image"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/50 rounded-full px-3 py-2">
                  {imageFiles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/80"
                      }`}
                      title={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Image info */}
            <div className="absolute top-4 left-4 bg-black/50 text-white rounded-lg px-3 py-2">
              <span className="text-sm">
                {currentIndex + 1} of {imageFiles.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AddQuizModal: React.FC<AddQuizModalProps> = ({
  showModal,
  setShowModal,
  userProp,
  subject,
  category
}) => {
  const [formData, setFormData] = useState<CreateQuizData>({
    user: userProp._id,
    question: '',
    subject: '',
    category: '',
    type: 'written', 
    choice: ['', '','',''], 
    correctAnswer: [''], 
    img: [],
    status: 'pending'
  });

    const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const createQuizMutation = useCreateQuiz();
  const { user } = useUser();
  const getKeyword = useGetKeyword({ status: 'approved' }); 
  const getGlobalKeyword = useGetKeyword({ isGlobal: true });
  const getQuestionBySubjectandCategory = useGetQuizzes({
    subjectID: formData.subject,
    categoryID: formData.category
  });

  const [dropdown, setDropdown] = useState<{[key: string]: boolean}>({});
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  // Combine approved and global keywords
  const allKeywords = [
    ...(getKeyword?.data || []),
    ...(getGlobalKeyword?.data || [])
  ];
  const shuffleArray = (array: any[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};
  
  const questionKeywordOptions = formData.category
    ? (() => {
        const globalKeywords = Array.from(new Set(allKeywords
          .filter((kw: Keyword) => kw.isGlobal)
          .flatMap((kw: Keyword) => {
             return kw.keywords.filter(k => !isNotPattern(k, true));
          }) as string[]));
        
        // เปลี่ยน ONLY GLOBAL KEYWORD
        // const categoryKeywords = Array.from(new Set(allKeywords
        //   .filter((kw: Keyword) => !kw.isGlobal && kw.category && kw.category._id === formData.category)
        //   .flatMap((kw: Keyword) => kw.keywords) as string[]));
        
        //return [...globalKeywords, ...categoryKeywords];
        return [...globalKeywords];
      })()
    : [];

// เปลี่ยนไปใช้ memo
//   const keywordOptions = formData.category
//     ? Array.from(new Set(allKeywords
//       .filter((kw: Keyword) => 
//         kw.isGlobal || (kw.category && kw.category._id === formData.category)
//       )
//       .flatMap((kw: Keyword) => {
//         return kw.keywords.filter(k => isNotPattern(k, kw.isGlobal));
//       }) as string[]))
//     : [];
  
  // 1. Caching Usage Count (ใช้วิธีนับแบบเรียบง่าย)
  const keywordFrequencyMap = useMemo(() => {
    const counts: Record<string, number> = {};
    const approvedQuizzes = getQuestionBySubjectandCategory.data?.filter((q: Quiz) => q.status === 'approved') || [];
    
    for (const quiz of approvedQuizzes) {
      for (const ans of quiz.correctAnswer) {
        counts[ans] = (counts[ans] || 0) + 1;
      }
    }
    return counts;
  }, [getQuestionBySubjectandCategory.data]);

  // 2. กรองและเรียงลำดับ (Unused -> Used)
  const keywordOptions = useMemo(() => {
    if (!formData.category) return [];

    const base = Array.from(new Set(allKeywords
      .filter((kw: Keyword) => kw.isGlobal || (kw.category && kw.category._id === formData.category))
      .flatMap((kw: Keyword) => kw.keywords.filter(k => isNotPattern(k, kw.isGlobal)))
    )) as string[];

    // Sort: คำที่ใช้น้อย (0) จะอยู่หน้าสุด
    return base.sort((a, b) => (keywordFrequencyMap[a] || 0) - (keywordFrequencyMap[b] || 0));
  }, [allKeywords, formData.category, keywordFrequencyMap]);

  // 3. กรองคำแนะนำ 10 คำแรก
  const suggestedKeywords = useMemo(() => keywordOptions.slice(0, 10), [keywordOptions]);

  // CSS Class Helper
  const getKeywordColorClass = (keyword: string) => {
    const freq = keywordFrequencyMap[keyword] || 0;
    if (freq === 0) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (freq <= 2) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-slate-500 bg-slate-50 border-slate-200";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        choice: value === 'choice' ? ['', ''] : [],
        correctAnswer: value === 'choice' ? [] : [''] 
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleChoiceChange = (index: number, value: string) => {
    setFormData(prev => {
      const newChoices = prev.choice.map((choice, i) => i === index ? value : choice);
      if (prev.correctAnswer.includes(prev.choice[index]) && !value.trim()) {
        return {
          ...prev,
          choice: newChoices,
          correctAnswer: []
        };
      }
      return {
        ...prev,
        choice: newChoices
      };
    });
  };
  const removeChoice = (index: number) => {
    setFormData(prev => ({
      ...prev,
      choice: prev.choice.filter((_, i) => i !== index),
      correctAnswer: prev.correctAnswer.filter(answer => answer !== prev.choice[index])
    }));
  };
  const handleAutoFillChoices = () => {
  const correctAnswer = formData.correctAnswer[0]; // สมมติว่าเป็น Single Choice
  if (!correctAnswer) {
    toast.error("Please select a correct answer first");
    return;
  }


  const relatedGroup = allKeywords.find((kw: Keyword) =>
    kw.keywords.includes(correctAnswer)
  );

  if (!relatedGroup) {
    toast.error("No related keywords found for this answer");
    return;
  }

  let distractors = relatedGroup.keywords.filter((kw: string) => kw !== correctAnswer);

  distractors = shuffleArray(distractors);


  const finalChoices = [correctAnswer, ...distractors.slice(0, 4)];
  
  const randomizedChoices = shuffleArray(finalChoices);

  setFormData({
    ...formData,
    choice: randomizedChoices
  });

  toast.success("Choices generated from keyword group!");
};

  const handleCorrectAnswerChange = (value: string, index: number) => {
    setFormData(prev => {
      if (prev.type === 'both' && index === 0) {
        const newAnswers = [...prev.correctAnswer];
        newAnswers[0] = value;
        return {
          ...prev,
          correctAnswer: newAnswers
        };
      }
      const newAnswers = [...prev.correctAnswer];
      newAnswers[index] = value;
      return {
        ...prev,
        correctAnswer: newAnswers.filter((answer, i) => prev.type === 'both' ? (i === 0 || answer.trim() !== '') : answer.trim() !== '')
      };
    });
  };

  const addCorrectAnswer = () => {
    setFormData(prev => ({
      ...prev,
      correctAnswer: [...prev.correctAnswer, '']
    }));
  };

  const removeCorrectAnswer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      correctAnswer: prev.correctAnswer.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  setError(""); // ล้าง error เก่า

  // 1. ตรวจสอบเบื้องต้น (Validation)
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.heic', '.heif'];
  const invalidFiles = files.filter(file => {
    const fileName = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/') || fileName.endsWith('.heic') || fileName.endsWith('.heif');
    return !isImage;
  });

  if (invalidFiles.length > 0) {
    setError('Only JPG, PNG, GIF and HEIC images are allowed');
    return;
  }

  try {
    // 2. ประมวลผลไฟล์ (แปลง HEIC ถ้าจำเป็น)
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const fileName = file.name.toLowerCase();
        
        // ตรวจสอบว่าเป็น HEIC หรือไม่
        if (fileName.endsWith(".heic") || fileName.endsWith(".heif") || file.type === "image/heic") {
          try {
            // แปลง HEIC เป็น Blob (JPEG)
            const convertedBlob = await heic2any({
              blob: file,
              toType: "image/jpeg",
              quality: 0.8 // ปรับคุณภาพได้ 0-1
            });

            // สร้าง File Object ใหม่จาก Blob
            const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            return new File(
              [finalBlob],
              file.name.replace(/\.(heic|heif)$/i, ".jpg"),
              { type: "image/jpeg" }
            );
          } catch (err) {
            console.error("HEIC Conversion Error:", err);
            return file; // ถ้าแปลงพลาด ให้ส่งไฟล์เดิมไป (แล้วค่อยไปลุ้นที่ Backend)
          }
        }
        return file; // ถ้าไม่ใช่ HEIC ส่งไฟล์เดิมกลับไป
      })
    );

    // 3. เก็บไฟล์ที่ประมวลผลแล้วลงใน State
    setImageFiles(prev => [...prev, ...processedFiles]);
    
  } catch (err) {
    setError("Failed to process images. Please try again.");
    console.error(err);
  }
};

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      user: userProp._id,
      question: '',
      subject: '',
      category: '',
      type: 'written',
      choice: ['', '','',''],
      correctAnswer: [''], // Reset to one empty answer
      img: [],
      status: 'pending'
    });
    setError(null);
    setImageFiles([]);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.question.trim()) {
      setError('Question is required');
      return;
    }
    if (!formData.subject) {
      setError('Subject is required');
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      return;
    }

    if (formData.type === 'choice') {
      if (!formData.choice.some(c => c.trim())) {
        setError('At least one choice is required');
        return;
      }
      if (formData.correctAnswer.length === 0) {
        setError('Please select a correct answer');
        return;
      }
    } else if (formData.type === 'written') {
      if (!formData.correctAnswer[0]?.trim()) {
        setError('Correct answer is required for written questions');
        return;
      }
    }

    if (!user._id) {
      return toast.error("There is no user ID");
    }

    try {
      const quizData: CreateQuizData = {
        user: user._id,
        question: formData.question.trim(),
        subject: formData.subject,
        category: formData.category,
        type: formData.type,
        choice: (formData.type === 'choice' || formData.type === 'both') ? formData.choice.map(c => c.trim()) : [],
        correctAnswer: formData.correctAnswer,
        img: [],
        status: 'pending',
        images: imageFiles 
      };

      await createQuizMutation.mutateAsync(quizData);
      toast.success("Quiz created successfully");
      resetForm();
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      setError(error.response?.data?.message || 'Failed to create quiz. Please try again.');
    }
  };

const usedCorrectAnswers = new Set(
  getQuestionBySubjectandCategory.data
    ?.filter((quiz: Quiz) => quiz.status === 'approved')
    .flatMap((quiz: Quiz) => quiz.correctAnswer) || []
);
  
// เปลี่ยนไปใช้ memo
// const unusedKeywords: string[] = [...new Set(keywordOptions as string[])]
//   .filter(keyword => !usedCorrectAnswers.has(keyword))
//   .slice(0, 10);

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
      <DialogContent className="sm:max-w-md md:max-w-lg [&>button:last-child]:hidden overflow-y-auto lg:mt-[2%] flex flex-col w-[90vw] md:max-w-4xl lg:w-[95vw] max-h-[60vh] md:max-h-[75vh] lg:max-h-[85vh] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add Quiz</DialogTitle>
          {/* Loading indicator for keywords/questions */}
          {(getKeyword.isLoading || getGlobalKeyword.isLoading || getQuestionBySubjectandCategory.isLoading) && (formData.subject && formData.category) && (
            <div className="flex items-center gap-2 text-blue-600 my-2">
              <LoaderIcon className="animate-spin w-5 h-5" />
              <span>Loading suggestions...</span>
            </div>
          )}
          {/* Show suggested keywords with color coding */}
          {!(getKeyword.isLoading || getGlobalKeyword.isLoading || getQuestionBySubjectandCategory.isLoading) && suggestedKeywords.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-gray-700">Keyword Suggestions:</p>
                <div className="flex gap-2 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-full"></span> Unused</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full"></span> Used</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {suggestedKeywords.map((keyword, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      handleCorrectAnswerChange(keyword, 0);
                      toast.success(`Selected: ${keyword}`);
                    }}
                    className={`text-xs px-2 py-1 rounded-md border transition-all hover:scale-105 select-none touch-manipulation ${getKeywordColorClass(keyword)}`}
                  >
                    {keyword} 
                    <span className="ml-1 opacity-60">({keywordFrequencyMap[keyword] || 0})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4 pb-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subject Selection */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Subject *</label>
            <DropdownMenu open={isSubjectOpen} onOpenChange={setIsSubjectOpen}>
              <DropdownMenuTrigger
              onPointerDown={(e) => e.preventDefault()} 
    onClick={() => setIsSubjectOpen(true)}
                className="w-full text-left [@media(hover:hover)]:hover:bg-gray-200 active:bg-gray-200 border border-gray-300 rounded-md p-2 transition duration-300 ease-in-out cursor-pointer">
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
                        category: '',
                        choice: ['', ''],
                        correctAnswer: [''],
                        img: [],
                      }));
                    }}
                  >
                    {s.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Category Selection */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Category *</label>
            <DropdownMenu open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
              <DropdownMenuTrigger 
                onPointerDown={(e) => e.preventDefault()} 
    onClick={() => {
        if (formData.subject) setIsCategoryOpen(true);
    }}
                className={`w-full text-left [@media(hover:hover)]:hover:bg-gray-200 active:bg-gray-200 border border-gray-300 rounded-md p-2 transition duration-300 ease-in-out cursor-pointer ${
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
                      .filter(c => c.subject && c.subject._id === formData.subject)
                      .map((c) => (
                  <DropdownMenuItem
                    key={c._id}
                    className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      category: c._id,
                      choice: ['', ''],
                      correctAnswer: [''],
                      img: [],
                    }))}
                  >
                    {c.category}
                  </DropdownMenuItem>
                ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Question */}
          <div className="relative">
            <label className="mb-1 block text-sm font-semibold">Question *</label>
            <input
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              onFocus={() => setDropdown(d => ({ ...d, question: true }))}
              onBlur={() => setTimeout(() => setDropdown(d => ({ ...d, question: false })), 150)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="Enter your question"
              autoComplete="off"
            />
            {dropdown.question && filterKeywords(questionKeywordOptions, formData.question).length > 0 && (
              <div className="absolute z-50 bg-white border border-gray-200 rounded shadow-lg mt-1 max-h-48 overflow-y-auto w-full">
                {filterKeywords(questionKeywordOptions, formData.question).map((keyword, idx) => {
                  // Check if this keyword is global
                  const isGlobal = allKeywords.some((kw: Keyword) => 
                    kw.isGlobal && kw.keywords.includes(keyword)
                  );
                  
                  return (
                    <div
                      key={idx}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm text-gray-800 flex items-center justify-between"
                      onMouseDown={() => {
                        handleInputChange({ target: { name: 'question', value: keyword } } as any);
                        setDropdown(d => ({ ...d, question: false }));
                      }}
                    >
                      <span>{decodeHTML(keyword)}</span>
                      {isGlobal && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-2">
                          Common
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Question Type */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Question Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="choice">MCQ</option>
              <option value="written">Written Answer</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Prepare keyword options for datalist */}
          {formData.category && (
            <datalist id="keyword-options">
              {allKeywords
                .filter((kw: Keyword) => 
                  kw.isGlobal || (kw.category && kw.category._id === formData.category)
                )
                .flatMap((kw: Keyword) => kw.keywords)
                .map((keyword: string, idx: number) => (
                  <option value={keyword} key={idx} />
                ))}
            </datalist>
          )}

          {formData.type === 'choice' || formData.type === 'both'? (
            <div>
              <label className="mb-1 block text-sm font-semibold">Choices *</label>
              <div className="flex justify-between items-center mb-2">
  <button
    type="button"
    onClick={handleAutoFillChoices}
    className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition"
  >
    ✨ Auto-fill from Keywords
  </button>
</div>
                {formData.choice.map((choice, index) => (
                <div key={index} className="mb-2 flex items-center gap-2">
                  <input
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswer.includes(choice)}
                  onChange={() => handleCorrectAnswerChange(choice, 0)}
                  disabled={!choice.trim()}
                  className={`w-4 h-4 ${!choice.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  />
                  <div className="relative flex-1">
                  <input
                    type="text"
                    value={choice}
                    onChange={e => handleChoiceChange(index, e.target.value)}
                    onClick={() => setDropdown(d => ({ ...d, ['choice' + index]: true }))}
                    onBlur={() => setTimeout(() => setDropdown(d => ({ ...d, ['choice' + index]: false })), 150)}
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    placeholder={`Choice ${index + 1}`}
                    autoComplete="off"
                  />
                  {dropdown['choice' + index] && filterKeywords(keywordOptions, choice).length > 0 && (
                    <div className="absolute z-50 bg-white border border-gray-200 rounded shadow-lg mt-1 max-h-48 overflow-y-auto w-full">
                    {filterKeywords(keywordOptions, choice).map((keyword, kidx) => {
  const freq = keywordFrequencyMap[keyword] || 0;
  return (
    <div
      key={kidx}
      className={`px-3 py-2 cursor-pointer border-l-4 transition-colors hover:bg-blue-50 flex justify-between items-center ${
        freq === 0 ? "border-emerald-400" : "border-gray-200"
      }`}
      onMouseDown={() => {
        handleChoiceChange(index, keyword);
        setDropdown(d => ({ ...d, ['choice' + index]: false }));
      }}
    >
      <span className="text-sm">{decodeHTML(keyword)}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
        freq === 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
      }`}>
        Used: {freq}
      </span>
    </div>
  );
})}
                    </div>
                  )}
                  </div>
                          <button
                type="button"
                onClick={() => removeChoice(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors ml-2"
                title="Remove choice"
                disabled={formData.choice.length <= 1}
                >
                <X className="w-5 h-5" />
                </button>
                </div>
                ))}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, choice: [...prev.choice, ''] }))}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700"
              >
                + Add Choice
              </button>
            </div>
          ) : null}

          {(formData.type === 'written' || formData.type === 'both') && (
            <div>
              <label className="mb-1 block text-sm font-semibold">Correct Answers *</label>
              {formData.correctAnswer.map((answer, index) => (
                <div key={index} className="mb-2 flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={answer}
                      onChange={e => handleCorrectAnswerChange(e.target.value, index)}
                      onFocus={() => setDropdown(d => ({ ...d, ['answer' + index]: true }))}
                      onBlur={() => setTimeout(() => setDropdown(d => ({ ...d, ['answer' + index]: false })), 150)}
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder={`Correct Answer ${index + 1}`}
                      autoComplete="off"
                      disabled={formData.type === 'both' && index === 0}
                    />
                    {dropdown['answer' + index] && filterKeywords(keywordOptions, answer).length > 0 && (
                      <div className="absolute z-50 bg-white border border-gray-200 rounded shadow-lg mt-1 max-h-48 overflow-y-auto w-full">
                        {filterKeywords(keywordOptions, answer).map((keyword, kidx) => (
                          <div
                            key={kidx}
                            className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm text-gray-800"
                            onMouseDown={() => {
                              handleCorrectAnswerChange(keyword, index);
                              setDropdown(d => ({ ...d, ['answer' + index]: false }));
                            }}
                          >
                            {keyword}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCorrectAnswer(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Remove answer"
                    disabled={formData.type === 'both' && index === 0}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCorrectAnswer}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Another Answer
              </button>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label htmlFor="images" className="mb-1 block text-sm font-semibold">
              Upload Images (Optional)
            </label>
            <input
              type="file"
              name="images"
              id="images"
              accept="image/*"
              onChange={handleImageChange}
              multiple
              className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-sm file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {imageFiles.length > 0 && (
              <ImagePreviewGallery 
                imageFiles={imageFiles} 
                onRemoveImage={removeImage}
              />
            )}
            {error && error.includes('image') && (
              <p className="text-red-500 text-sm">Please upload valid images.</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Buttons */}
          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 pt-4 bottom-0 bg-white">
            <Button
              textButton="Submit"
              disabled={createQuizMutation.isPending}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600"
            >
              {createQuizMutation.isPending ? (
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
                className="w-full sm:w-auto bg-red-500 hover:bg-red-800"
                onClick={resetForm}
              />
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuizModal;
