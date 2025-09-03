'use client'
import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  X, 
  Upload, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Play,
  FileVideo,
  Settings,
  Clock
} from "lucide-react";

// Upload status constants
const UPLOAD_STATUS = {
  PENDING: 0,
  PROCESSING: 1,
  UPLOADING: 2,
  COMPLETED: 3,
  FAILED: 4
};

// Progress stages with project color scheme (#0AAC9E)
const PROGRESS_STAGES = [
  {
    id: 0,
    status: UPLOAD_STATUS.PENDING,
    title: 'Waiting',
    subtitle: 'Waiting for video upload to begin',
    icon: Clock,
    color: 'teal',
    bgColor: 'bg-[#0AAC9E]/10',
    borderColor: 'border-[#0AAC9E]/30',
    iconColor: 'text-[#0AAC9E]',
    progressColor: 'bg-gradient-to-r from-[#0AAC9E]/80 to-[#0AAC9E]'
  },
  {
    id: 1,
    status: UPLOAD_STATUS.UPLOADING,
    title: 'Uploading',
    subtitle: 'Video is being uploaded to server',
    icon: Upload,
    color: 'teal',
    bgColor: 'bg-[#0AAC9E]/10',
    borderColor: 'border-[#0AAC9E]/30',
    iconColor: 'text-[#0AAC9E]',
    progressColor: 'bg-gradient-to-r from-[#0AAC9E]/80 to-[#0AAC9E]'
  },
  {
    id: 2,
    status: UPLOAD_STATUS.PROCESSING,
    title: 'Processing',
    subtitle: 'Video is being processed and HLS segments created',
    icon: Settings,
    color: 'teal',
    bgColor: 'bg-[#0AAC9E]/10',
    borderColor: 'border-[#0AAC9E]/30',
    iconColor: 'text-[#0AAC9E]',
    progressColor: 'bg-gradient-to-r from-[#0AAC9E]/80 to-[#0AAC9E]'
  },
  {
    id: 3,
    status: UPLOAD_STATUS.COMPLETED,
    title: 'Completed',
    subtitle: 'Video is ready and can be played',
    icon: CheckCircle,
    color: 'teal',
    bgColor: 'bg-[#0AAC9E]/10',
    borderColor: 'border-[#0AAC9E]/30',
    iconColor: 'text-[#0AAC9E]',
    progressColor: 'bg-gradient-to-r from-[#0AAC9E]/80 to-[#0AAC9E]'
  }
];

const VideoUploadProgress = ({ contentId, onComplete, onError, onBack }) => {
  const [uploadStatus, setUploadStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const pollIntervalRef = useRef(null);

  // Simulate poll upload status (replace with real API call)
  const pollUploadStatus = useCallback(async () => {
    if (!contentId) return;
    
    try {
      // Call your existing API function
      const { getUploadStatus } = await import('@/api/courseContent');
      const response = await getUploadStatus(contentId);
      
      setUploadStatus(response);
      setProgress(response.uploadProgress || 0);
      setInitializing(false);
      
      if (response.uploadStatus === UPLOAD_STATUS.COMPLETED) {
        setPolling(false);
        onComplete && onComplete(response);
      } else if (response.uploadStatus === UPLOAD_STATUS.FAILED) {
        setPolling(false);
        setError('Video upload failed');
        onError && onError('Upload failed');
      }
      
    } catch (err) {
      console.error('Error polling upload status:', err);
      
      if (initializing && err.message.includes('not found')) {
        console.log('Content not found yet, will retry...');
        return;
      }
      
      setError(err.message);
      setPolling(false);
      onError && onError(err.message);
    }
  }, [contentId, onComplete, onError, initializing]);

  // Start polling when component mounts
  useEffect(() => {
    if (contentId && !polling) {
      console.log('Starting upload status polling for content:', contentId);
      setPolling(true);
      setInitializing(true);
      
      pollUploadStatus();
      
      pollIntervalRef.current = setInterval(() => {
        pollUploadStatus();
      }, 2000);
    }
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [contentId, polling, pollUploadStatus]);

  const getCurrentStage = () => {
    if (!uploadStatus && initializing) {
      return PROGRESS_STAGES[1]; // UPLOADING
    }
    if (!uploadStatus) return PROGRESS_STAGES[0];
    return PROGRESS_STAGES.find(stage => stage.status === uploadStatus.uploadStatus) || PROGRESS_STAGES[0];
  };

  const getStageStatus = (stage) => {
    if (!uploadStatus && initializing) {
      if (stage.status === UPLOAD_STATUS.UPLOADING) return 'active';
      return 'pending';
    }
    if (!uploadStatus) return 'pending';
    if (stage.status < uploadStatus.uploadStatus) return 'completed';
    if (stage.status === uploadStatus.uploadStatus) return 'active';
    return 'pending';
  };

  const currentStage = getCurrentStage();
  const completedStages = uploadStatus ? PROGRESS_STAGES.filter(stage => stage.status < uploadStatus.uploadStatus).length : 0;
  const totalStages = PROGRESS_STAGES.length;
  const overallProgress = uploadStatus ? ((completedStages + (progress / 100)) / totalStages) * 100 : 25;

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Error Occurred</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => {
              setError(null);
              setPolling(false);
              setInitializing(true);
            }}
            className="flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Retry
          </button>
          <button 
            onClick={onBack} 
            className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0AAC9E] to-[#0AAC9E]/80 rounded-2xl mb-4 shadow-lg">
          <FileVideo className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Video Upload Process</h3>
        <p className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full inline-block">
          Content ID: {contentId}
        </p>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <span className="text-lg font-bold text-gray-900">{Math.round(overallProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-[#0AAC9E]/80 to-[#0AAC9E] transition-all duration-1000 ease-out rounded-full shadow-sm"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Start</span>
          <span>Completed</span>
        </div>
      </div>

      {/* Current Status Card */}
      {uploadStatus && (
        <div className={`${currentStage.bgColor} ${currentStage.borderColor} border-2 rounded-2xl p-6 mb-8 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-xl shadow-md">
                {(currentStage.status === UPLOAD_STATUS.PROCESSING || currentStage.status === UPLOAD_STATUS.UPLOADING) ? (
                  <Loader2 className={`w-7 h-7 ${currentStage.iconColor} animate-spin`} />
                ) : (
                  <currentStage.icon className={`w-7 h-7 ${currentStage.iconColor}`} />
                )}
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">{currentStage.title}</h4>
                <p className="text-sm text-gray-700">{currentStage.subtitle}</p>
              </div>
            </div>
            
            {(currentStage.status === UPLOAD_STATUS.UPLOADING || currentStage.status === UPLOAD_STATUS.PROCESSING) && (
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 mb-1">{Math.round(progress)}%</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">Progress</div>
              </div>
            )}
          </div>
          
          {(currentStage.status === UPLOAD_STATUS.UPLOADING || currentStage.status === UPLOAD_STATUS.PROCESSING) && (
            <div className="mt-4">
              <div className="w-full bg-white/70 rounded-full h-2 shadow-inner">
                <div 
                  className={`h-full ${currentStage.progressColor} rounded-full transition-all duration-500 shadow-sm`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stages Timeline */}
      <div className="space-y-4 mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Process Stages</h4>
        {PROGRESS_STAGES.map((stage, index) => {
          const stageStatus = getStageStatus(stage);
          
          return (
            <div key={stage.id} className="flex items-center space-x-4">
              {/* Stage Number and Connector */}
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-3 transition-all duration-300 ${
                  stageStatus === 'completed' 
                    ? 'bg-[#0AAC9E] border-[#0AAC9E] text-white' 
                    : stageStatus === 'active'
                    ? `bg-white ${stage.borderColor} border-2`
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {stageStatus === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : stageStatus === 'active' ? (
                    stage.status === UPLOAD_STATUS.PROCESSING || stage.status === UPLOAD_STATUS.UPLOADING ? (
                      <Loader2 className={`w-5 h-5 ${stage.iconColor} animate-spin`} />
                    ) : (
                      <stage.icon className={`w-5 h-5 ${stage.iconColor}`} />
                    )
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                {index < PROGRESS_STAGES.length - 1 && (
                  <div className={`w-0.5 h-8 mt-2 ${
                    stageStatus === 'completed' ? 'bg-[#0AAC9E]' : 'bg-gray-200'
                  }`} />
                )}
              </div>

              {/* Stage Content */}
              <div className="flex-1">
                <div className={`font-semibold ${
                  stageStatus === 'pending' ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {stage.title}
                </div>
                <div className={`text-sm ${
                  stageStatus === 'pending' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stage.subtitle}
                </div>
              </div>

              {/* Status Indicator */}
              {stageStatus === 'completed' && (
                <div className="flex items-center text-[#0AAC9E]">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
              
              {stageStatus === 'active' && (currentStage.status === UPLOAD_STATUS.UPLOADING || currentStage.status === UPLOAD_STATUS.PROCESSING) && (
                <div className="flex items-center text-[#0AAC9E]">
                  <div className="text-sm font-semibold">{Math.round(progress)}%</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Success State */}
      {uploadStatus?.uploadStatus === UPLOAD_STATUS.COMPLETED && uploadStatus.segments && (
        <div className="bg-gradient-to-r from-[#0AAC9E]/10 to-[#0AAC9E]/5 border-2 border-[#0AAC9E]/30 rounded-2xl p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-[#0AAC9E] rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#0AAC9E] mb-2">Video Ready!</h4>
              <p className="text-gray-700 mb-3">
                Video has been successfully uploaded and is ready for streaming.
              </p>
              <div className="flex items-center text-sm text-[#0AAC9E] bg-white/60 px-3 py-2 rounded-lg">
                <FileVideo className="w-4 h-4 mr-2" />
                {uploadStatus.segments.length} segments created
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        
        {uploadStatus?.uploadStatus === UPLOAD_STATUS.COMPLETED && (
          <button
            onClick={() => onComplete && onComplete(uploadStatus)}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-[#0AAC9E] to-[#0AAC9E]/90 text-white rounded-xl hover:from-[#0AAC9E]/90 hover:to-[#0AAC9E] transition-all shadow-lg font-semibold"
          >
            <Play className="w-5 h-5 mr-2" />
            Complete
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoUploadProgress;