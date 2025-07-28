'use client'
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Eye, 
  Users, 
  BookOpen, 
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Globe,
  Settings
} from "lucide-react";
import {
  nextStep,
  prevStep,
  setCurrentStep,
  setModalOpen
} from "@/redux/course/courseSlice";

const CourseCreateLayout = ({ children, isEditing = false }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { 
    currentStep, 
    formData, 
    sections,
    loading,
    currentCourse
  } = useSelector((state) => state.course || {});

  const steps = [
    {
      number: 1,
      title: "Course Information",
      description: "Basic course details",
      icon: BookOpen
    },
    {
      number: 2,
      title: "Course Content",
      description: "Add sections and materials",
      icon: Settings
    },
    {
      number: 3,
      title: "Target Groups",
      description: "Assign and publish",
      icon: Target
    }
  ];

  // Sadə validation - yalnız course yaradılıb yaradılmadığını yoxlayaq
  const canProceedToStep2 = !!currentCourse?.id;
  const canProceedToStep3 = !!currentCourse?.id; // Step 3 üçün də yalnız course ID lazımdır

  const handleNext = () => {
    if (currentStep === 1 && !canProceedToStep2) {
      alert("Əvvəlcə kursu yadda saxlayın!");
      return;
    }
    
    if (currentStep < 3) {
      dispatch(nextStep());
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      dispatch(prevStep());
    }
  };

  const handleStepClick = (stepNumber) => {
    // Sadə məntiqi - əgər kurs yaradılıbsa bütün step-lərə icazə ver
    if (stepNumber === 1) {
      dispatch(setCurrentStep(stepNumber));
    } else if (stepNumber === 2 && canProceedToStep2) {
      dispatch(setCurrentStep(stepNumber));
    } else if (stepNumber === 3 && canProceedToStep3) {
      dispatch(setCurrentStep(stepNumber));
    } else if (stepNumber > 1 && !currentCourse?.id) {
      alert("Əvvəlcə kursu yaradın!");
    }
  };

  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'active';
    
    // Növbəti step-lər üçün yoxlama
    if (stepNumber === 2 && canProceedToStep2) return 'available';
    if (stepNumber === 3 && canProceedToStep3) return 'available';
    
    return 'disabled';
  };

  const getStepMessage = () => {
    switch (currentStep) {
      case 1:
        if (!currentCourse?.id) {
          return "Kurs məlumatlarını doldurun və yadda saxlayın";
        }
        return "Kurs uğurla yaradıldı!";
      case 2:
        return "Kurs strukturunu qurun";
      case 3:
        return "Hədəf qrupları təyin edin";
      default:
        return "";
    }
  };

  const stepMessage = getStepMessage();
  const isError = stepMessage.includes("doldurun") || stepMessage.includes("yaradın");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Sol tərəf */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/courses')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Kurslara qayıt
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Kursu Redaktə Et' : 'Yeni Kurs Yarat'}
                </h1>
                {currentCourse?.name && (
                  <p className="text-sm text-gray-500">{currentCourse.name}</p>
                )}
              </div>
            </div>

            {/* Sağ tərəf */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => dispatch(setModalOpen({ modal: 'coursePreview', isOpen: true }))}
                disabled={!currentCourse?.id}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Önizləmə
              </button>

              {currentCourse?.id && (
                <button
                  onClick={() => dispatch(setModalOpen({ modal: 'assignUsers', isOpen: true }))}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  İstifadəçi Təyin Et
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Kurs yaradıldığında uğur mesajı */}
      {currentCourse?.id && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  Kurs uğurla yaradıldı! ID: #{currentCourse.id}
                </span>
                <span className="ml-4 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Qaralama
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav aria-label="Progress">
              <ol className="flex items-center justify-center space-x-8">
                {steps.map((step, index) => {
                  const status = getStepStatus(step.number);
                  const StepIcon = step.icon;
                  
                  return (
                    <li key={step.number} className="flex items-center">
                      {/* Step */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => handleStepClick(step.number)}
                          disabled={status === 'disabled'}
                          className={`
                            flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200
                            ${status === 'completed' 
                              ? 'bg-[#0AAC9E] border-[#0AAC9E] text-white' 
                              : status === 'active'
                              ? 'bg-[#0AAC9E] border-[#0AAC9E] text-white ring-4 ring-[#0AAC9E]/20'
                              : status === 'available'
                              ? 'bg-white border-[#0AAC9E] text-[#0AAC9E] hover:bg-[#0AAC9E]/5 cursor-pointer'
                              : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                            }
                          `}
                        >
                          {status === 'completed' ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <StepIcon className="w-5 h-5" />
                          )}
                        </button>
                        
                        <div className="mt-3 text-center">
                          <p className={`text-sm font-medium ${
                            status === 'active' ? 'text-[#0AAC9E]' :
                            status === 'completed' ? 'text-[#0AAC9E]' :
                            status === 'available' ? 'text-gray-900' :
                            'text-gray-400'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Bağlayıcı xətt */}
                      {index < steps.length - 1 && (
                        <div className={`w-16 h-0.5 mx-4 ${
                          getStepStatus(step.number + 1) !== 'disabled' 
                            ? 'bg-[#0AAC9E]' 
                            : 'bg-gray-300'
                        }`} />
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* Hazırki step-in statusu */}
            <div className="mt-4 text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${
                isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}>
                {isError ? (
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                )}
                <span className={`text-sm font-medium ${
                  isError ? 'text-red-800' : 'text-green-800'
                }`}>
                  {stepMessage}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Əsas məzmun */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8">
            {children}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between px-8 py-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Əvvəlki
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Addım {currentStep} / {steps.length}
              </span>
            </div>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && !currentCourse?.id}
                className={`flex items-center px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  currentStep === 1 && !currentCourse?.id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#0AAC9E] hover:bg-[#0AAC9E]/90'
                }`}
              >
                {currentStep === 1 && !currentCourse?.id ? (
                  <>
                    Əvvəl Yadda Saxla
                    <Save className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Növbəti
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => dispatch(setModalOpen({ modal: 'publishConfirm', isOpen: true }))}
                disabled={!currentCourse?.id}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Globe className="w-4 h-4 mr-2" />
                Dərc Et
              </button>
            )}
          </div>
        </div>

        {/* Köməkçi məlumat */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-xs font-bold text-blue-600">!</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Addım təlimatları</h4>
              <div className="text-xs text-blue-800 space-y-1">
                {currentStep === 1 && (
                  <p>• Kurs adı, təsviri, kateqoriya və müddəti daxil edin və "Yadda Saxla" düyməsini basın</p>
                )}
                {currentStep === 2 && (
                  <p>• Kursunuz üçün bölmələr yaradın və hər bölməyə məzmun əlavə edin</p>
                )}
                {currentStep === 3 && (
                  <p>• Kursun əlçatan olacağı hədəf qrupları seçin və dərc parametrlərini tənzimləyin</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCreateLayout;