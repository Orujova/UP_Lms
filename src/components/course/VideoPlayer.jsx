import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, 
  SkipBack, SkipForward, Download, Loader2, AlertCircle, 
  Upload, Subtitles, Languages, Plus, X, Clock, Target, Trash2,
  Video as VideoIcon, PlayCircle, Edit2, Eye, Check, FileText
} from "lucide-react";

import { 
  getContentPaths, 
  getContentStream,
  getSubtitlesByVideoId,
  addSubtitle,
  deleteSubtitle,
  addVideoInteraction,
  getVideoStreamingUrl,
  SUBTITLE_LANGUAGES,
  INTERACTION_TYPES,
  getLanguageName
} from "@/api/courseContent";

// Evaluation emoji sets based on backend enum
const EVALUATION_EMOJI_SETS = {
  HEART_EMOJI: 1,
  SMILE_EMOJI: 2,
  MEDAL_EMOJI: 3,
  PLANT_EMOJI: 4
};

const EMOJI_MAPPINGS = {
  [EVALUATION_EMOJI_SETS.HEART_EMOJI]: [
    { value: 1, emoji: '🖤', label: 'Needs improvement' },
    { value: 2, emoji: '💙', label: 'Developing' },
    { value: 3, emoji: '💚', label: 'Satisfactory' },
    { value: 4, emoji: '💛', label: 'Good' },
    { value: 5, emoji: '❤️', label: 'Excellent' }
  ],
  [EVALUATION_EMOJI_SETS.SMILE_EMOJI]: [
    { value: 1, emoji: '😞', label: 'Needs Improvement' },
    { value: 2, emoji: '😐', label: 'Fair' },
    { value: 3, emoji: '🙂', label: 'Satisfactory' },
    { value: 4, emoji: '😃', label: 'Good' },
    { value: 5, emoji: '🤩', label: 'Outstanding' }
  ],
  [EVALUATION_EMOJI_SETS.MEDAL_EMOJI]: [
    { value: 1, emoji: '🏅', label: 'Participation' },
    { value: 2, emoji: '🥉', label: 'Fair' },
    { value: 3, emoji: '🥈', label: 'Good' },
    { value: 4, emoji: '🥇', label: 'Very Good' },
    { value: 5, emoji: '🏆', label: 'Excellent' }
  ],
  [EVALUATION_EMOJI_SETS.PLANT_EMOJI]: [
    { value: 1, emoji: '🌱', label: 'Learning' },
    { value: 2, emoji: '🌿', label: 'Progressing' },
    { value: 3, emoji: '🌾', label: 'Performing' },
    { value: 4, emoji: '🌻', label: 'Strong' },
    { value: 5, emoji: '🌳', label: 'Excellent' }
  ]
};

const EnhancedVideoPlayer = ({ 
  content, 
  onClose, 
  showInteractions = true, 
  showSubtitles = true,
  autoplay = false
}) => {
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const containerRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);
  const hlsRef = useRef(null);
  
  // Core video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  // UI states
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Streaming state  
  const [videoUrl, setVideoUrl] = useState(null);
  const [streamingReady, setStreamingReady] = useState(false);
  const [hlsSupported, setHlsSupported] = useState(false);

  // Subtitle state
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState(null);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showSubtitleUpload, setShowSubtitleUpload] = useState(false);
  const [showSubtitleEditor, setShowSubtitleEditor] = useState(false);
  const [subtitleLoading, setSubtitleLoading] = useState(false);

  // Progress Bar state
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [showTimeTooltip, setShowTimeTooltip] = useState(false);

  // Menu states
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showPlaybackRateMenu, setShowPlaybackRateMenu] = useState(false);
  
  // Interaction state
  const [showAddInteraction, setShowAddInteraction] = useState(false);

  const contentId = content?.id || content?.contentId;
  const isVideoType = content?.type === 4 || content?.contentType === 'Video';

  // Check HLS support
  useEffect(() => {
    const video = document.createElement('video');
    setHlsSupported(video.canPlayType('application/vnd.apple.mpegurl') !== '');
  }, []);

  // Time formatting helper
  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return "0:00";
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  // Progress calculation
  const progressPercentage = useMemo(() => {
    if (!duration || duration <= 0 || isNaN(currentTime) || isNaN(duration)) return 0;
    const time = isDragging ? (dragPosition * duration / 100) : currentTime;
    return Math.max(0, Math.min(100, (time / duration) * 100));
  }, [currentTime, duration, isDragging, dragPosition]);

  // Buffered percentage
  const bufferedPercentage = useMemo(() => {
    const video = videoRef.current;
    if (!video || !duration || duration <= 0 || video.buffered.length === 0) return 0;
    
    try {
      const buffered = video.buffered.end(video.buffered.length - 1);
      return Math.max(0, Math.min(100, (buffered / duration) * 100));
    } catch (error) {
      return 0;
    }
  }, [currentTime, duration]);

  // Update current time
  const updateCurrentTime = useCallback(() => {
    const video = videoRef.current;
    if (!video || isSeeking || isDragging) return;
    
    try {
      const time = video.currentTime || 0;
      const dur = video.duration || 0;
      
      if (!isNaN(time) && isFinite(time)) {
        setCurrentTime(time);
      }
      
      if (!isNaN(dur) && isFinite(dur) && dur > 0) {
        setDuration(dur);
      }
    } catch (error) {
      console.warn('Time update error:', error);
    }
  }, [isSeeking, isDragging]);

  // Time update interval
  useEffect(() => {
    if (isPlaying && !isSeeking && !isDragging) {
      timeUpdateIntervalRef.current = setInterval(() => {
        updateCurrentTime();
      }, 100);
    } else {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    };
  }, [isPlaying, isSeeking, isDragging, updateCurrentTime]);

  // Video loading logic using real API
  useEffect(() => {
    const loadVideoStream = async () => {
      if (!contentId || !isVideoType) {
        setVideoError('Invalid content type or missing content ID');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setVideoError(null);

      try {
        console.log('🎬 Loading video stream for content:', contentId);
        
        // Check upload status first
        if (content?.uploadStatus !== undefined && content.uploadStatus !== 3) {
          const statusMessages = {
            0: 'Video upload is pending',
            1: 'Video is being processed', 
            2: 'Video is uploading',
            4: 'Video upload failed'
          };
          
          const message = statusMessages[content.uploadStatus] || 'Video is not ready';
          console.log('⚠️ Video not ready:', message, 'Status:', content.uploadStatus);
          setVideoError(message);
          setIsLoading(false);
          return;
        }

        // Try to get streaming URL
        try {
          const streamingResult = await getVideoStreamingUrl(contentId);
          console.log('🔗 Streaming result:', streamingResult);
          
          if (streamingResult.success && streamingResult.streamingUrl) {
            console.log('✅ Video streaming URL ready:', streamingResult.streamingUrl);
            setVideoUrl(streamingResult.streamingUrl);
            setStreamingReady(true);
            setIsLoading(false);
            return;
          }
        } catch (streamingError) {
          console.warn('⚠️ Streaming URL failed, trying direct URL:', streamingError.message);
        }

        // Fallback to direct content URL
        if (content?.data || content?.contentString) {
          const directUrl = content.data || content.contentString;
          console.log('🔗 Using direct content URL:', directUrl);
          
          if (directUrl && (
            directUrl.includes('coursecontent/') || 
            directUrl.includes('.mp4') || 
            directUrl.includes('.webm') || 
            directUrl.includes('.mov') ||
            directUrl.startsWith('http') ||
            directUrl.startsWith('blob:')
          )) {
            setVideoUrl(directUrl);
            setStreamingReady(true);
            setIsLoading(false);
            return;
          } else {
            throw new Error('Invalid video URL format');
          }
        } else {
          throw new Error('No video source available');
        }

      } catch (error) {
        console.error('❌ Error loading video:', error);
        setVideoError(error.message || 'Failed to load video');
        setIsLoading(false);
      }
    };

    loadVideoStream();
  }, [contentId, isVideoType, content?.data, content?.contentString, content?.uploadStatus]);

  // Load subtitles using real API
  useEffect(() => {
    const loadSubtitles = async () => {
      if (!contentId || !showSubtitles) return;

      try {
        setSubtitleLoading(true);
        console.log('📝 Loading subtitles for content:', contentId);
        
        const subtitlesResponse = await getSubtitlesByVideoId(contentId);
        const subtitleList = Array.isArray(subtitlesResponse) 
          ? subtitlesResponse 
          : subtitlesResponse?.subtitles || [];
          
        console.log('📝 Loaded subtitles:', subtitleList);
        setSubtitles(subtitleList);
      } catch (error) {
        console.warn('Could not load subtitles:', error.message);
        setSubtitles([]);
      } finally {
        setSubtitleLoading(false);
      }
    };

    loadSubtitles();
  }, [contentId, showSubtitles]);

  // Video element setup
  useEffect(() => {
    if (!videoRef.current || !videoUrl || !streamingReady) return;

    const video = videoRef.current;
    console.log('🎥 Setting up video element with URL:', videoUrl);
    
    const isHlsStream = videoUrl.startsWith('blob:') || videoUrl.includes('.m3u8');
    
    const handleLoadedMetadata = () => {
      console.log('📊 Video metadata loaded');
      const dur = video.duration || 0;
      if (!isNaN(dur) && isFinite(dur) && dur > 0) {
        setDuration(dur);
        setIsLoading(false);
        
        if (autoplay) {
          video.play().catch(console.warn);
        }
      }
    };

    const handlePlay = () => {
      console.log('▶️ Video playing');
      setIsPlaying(true);
      setIsBuffering(false);
    };

    const handlePause = () => {
      console.log('⏸️ Video paused');
      setIsPlaying(false);
    };

    const handleEnded = () => {
      console.log('🏁 Video ended');
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      console.log('⏳ Video buffering');
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      console.log('✅ Video can play');
      setIsBuffering(false);
    };

    const handleSeeking = () => {
      console.log('🎯 Video seeking');
      setIsSeeking(true);
    };

    const handleSeeked = () => {
      console.log('✅ Video seeked');
      setIsSeeking(false);
      updateCurrentTime();
    };

    const handleError = (e) => {
      console.error('❌ Video error:', e);
      setVideoError('Video playback error');
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      if (!isSeeking && !isDragging) {
        updateCurrentTime();
      }
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);

    if (isHlsStream && !hlsSupported) {
      const loadHls = async () => {
        if (!window.Hls) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
          script.onload = setupHlsPlayer;
          script.onerror = () => setVideoError('Failed to load HLS library');
          document.head.appendChild(script);
        } else {
          setupHlsPlayer();
        }
      };

      const setupHlsPlayer = () => {
        if (window.Hls?.isSupported()) {
          const hls = new window.Hls({
            debug: false,
            enableWorker: true
          });
          
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
          
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            console.log('🔗 HLS manifest parsed');
            setIsLoading(false);
          });

          hls.on(window.Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              setVideoError(`HLS Error: ${data.details}`);
            }
          });
          
          hlsRef.current = hls;
        }
      };

      loadHls();
    } else {
      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      video.load();
    }

    return () => {
      // Cleanup
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl, streamingReady, autoplay, hlsSupported, updateCurrentTime, isSeeking, isDragging]);

  // Enhanced seek function
  const handleSeek = useCallback((time) => {
    const video = videoRef.current;
    if (!video || !duration || isNaN(time)) return;
    
    // Check if seeking is enabled for this content
    if (content?.isSeekingEnabled === false) {
      console.log('🚫 Seeking is disabled for this content');
      return;
    }
    
    try {
      const newTime = Math.max(0, Math.min(duration, time));
      console.log('🎯 Seeking to:', newTime);
      
      setIsSeeking(true);
      video.currentTime = newTime;
      setCurrentTime(newTime);
      
      setTimeout(() => {
        setIsSeeking(false);
        updateCurrentTime();
      }, 100);
    } catch (error) {
      console.error('Seek error:', error);
      setIsSeeking(false);
    }
  }, [duration, updateCurrentTime, content?.isSeekingEnabled]);

  // Progress bar handlers
  const handleProgressMouseDown = useCallback((event) => {
    if (!progressBarRef.current || !duration || duration <= 0) return;
    
    // Check if seeking is enabled
    if (content?.isSeekingEnabled === false) {
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const barWidth = rect.width;
    
    if (barWidth > 0) {
      const clickPosition = Math.max(0, Math.min(1, clickX / barWidth));
      const newPosition = clickPosition * 100;
      
      setIsDragging(true);
      setDragPosition(newPosition);
    }
  }, [duration, content?.isSeekingEnabled]);

  const handleProgressMouseMove = useCallback((event) => {
    if (!progressBarRef.current || !duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const hoverX = event.clientX - rect.left;
    const barWidth = rect.width;
    
    if (barWidth > 0) {
      const hoverPos = Math.max(0, Math.min(1, hoverX / barWidth));
      const time = hoverPos * duration;
      
      setHoverTime(time);
      setHoverPosition(hoverPos * 100);
      setShowTimeTooltip(true);
      
      if (isDragging && content?.isSeekingEnabled !== false) {
        setDragPosition(hoverPos * 100);
      }
    }
  }, [duration, isDragging, content?.isSeekingEnabled]);

  const handleProgressMouseUp = useCallback(() => {
    if (isDragging && duration && content?.isSeekingEnabled !== false) {
      const newTime = (dragPosition / 100) * duration;
      handleSeek(newTime);
    }
    setIsDragging(false);
  }, [isDragging, dragPosition, duration, handleSeek, content?.isSeekingEnabled]);

  const handleProgressMouseLeave = useCallback(() => {
    setShowTimeTooltip(false);
    if (isDragging) {
      handleProgressMouseUp();
    }
  }, [isDragging, handleProgressMouseUp]);

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e) => handleProgressMouseMove(e);
      const handleGlobalMouseUp = () => handleProgressMouseUp();
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleProgressMouseMove, handleProgressMouseUp]);

  // Enhanced subtitle change handler using real API
  const handleSubtitleChange = useCallback(async (subtitle) => {
    const video = videoRef.current;
    if (!video) return;

    const existingTracks = Array.from(video.querySelectorAll('track'));
    existingTracks.forEach(track => track.remove());

    if (!subtitle) {
      setCurrentSubtitle(null);
      return;
    }

    try {
      if (subtitle.fileUrl || subtitle.fileName) {
        const fileName = subtitle.fileName || subtitle.fileUrl.split('/').pop();
        console.log('📝 Loading subtitle file:', fileName);
        
        const subtitleBlob = await getContentStream(contentId, fileName);
        const subtitleText = await subtitleBlob.text();
        
        console.log('📝 Subtitle content loaded');
        
        const subtitleBlobUrl = URL.createObjectURL(
          new Blob([subtitleText], { type: 'text/vtt' })
        );
        
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.src = subtitleBlobUrl;
        track.label = subtitle.name;
        track.default = true;
        
        video.appendChild(track);
        setCurrentSubtitle(subtitle);
        
        track.addEventListener('load', () => {
          if (video.textTracks[0]) {
            video.textTracks[0].mode = 'showing';
          }
        });
      }
    } catch (error) {
      console.error('Failed to load subtitle:', error);
    }
  }, [contentId]);

  // Control functions
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    try {
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Play failed:', error);
            setVideoError('Playback failed: ' + error.message);
          });
        }
      } else {
        video.pause();
      }
    } catch (error) {
      console.error('Toggle play error:', error);
    }
  }, [videoUrl]);

  const skipTime = useCallback((seconds) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    handleSeek(newTime);
  }, [currentTime, duration, handleSeek]);

  const handleVolumeChange = useCallback((newVolume) => {
    const video = videoRef.current;
    if (!video) return;
    
    try {
      const vol = Math.max(0, Math.min(1, newVolume));
      video.volume = vol;
      video.muted = vol === 0;
      setVolume(vol);
      setIsMuted(vol === 0);
    } catch (error) {
      console.error('Volume change error:', error);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isMuted) {
        const newVol = volume || 0.5;
        video.volume = newVol;
        video.muted = false;
        setIsMuted(false);
        setVolume(newVol);
      } else {
        video.volume = 0;
        video.muted = true;
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Mute toggle error:', error);
    }
  }, [isMuted, volume]);

  const changePlaybackRate = useCallback((rate) => {
    const video = videoRef.current;
    if (!video) return;
    
    try {
      video.playbackRate = rate;
      setPlaybackRate(rate);
      setShowPlaybackRateMenu(false);
    } catch (error) {
      console.error('Playback rate error:', error);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        container.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout;
    
    const showControlsTemporarily = () => {
      setShowControls(true);
      clearTimeout(timeout);
      
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', showControlsTemporarily);
      container.addEventListener('click', showControlsTemporarily);
      
      return () => {
        container.removeEventListener('mousemove', showControlsTemporarily);
        container.removeEventListener('click', showControlsTemporarily);
        clearTimeout(timeout);
      };
    }
  }, [isPlaying]);

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#0AAC9E' }} />
          <p className="text-lg">Loading video...</p>
          <p className="text-sm text-gray-300 mt-2">
            Content ID: {contentId}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (videoError) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-center text-white max-w-md px-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-3">Video Error</h3>
          <p className="text-gray-300 mb-6">{videoError}</p>
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Close Player
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Video Element */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          crossOrigin="anonymous"
          controls={false}
          onClick={togglePlay}
        />

        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 rounded-xl p-4 text-white">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: '#0AAC9E' }} />
              <p className="text-sm">Buffering...</p>
            </div>
          </div>
        )}

        {/* Seeking Indicator */}
        {(isSeeking || isDragging) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 rounded-xl p-4 text-white">
              <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: '#0AAC9E' }} />
              <p className="text-sm">
                {formatTime(isDragging ? (dragPosition * duration / 100) : currentTime)}
              </p>
            </div>
          </div>
        )}

        {/* Seeking Disabled Indicator */}
        {content?.isSeekingEnabled === false && (showTimeTooltip || isDragging) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-red-600/80 rounded-xl p-4 text-white">
              <AlertCircle className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">Seeking is disabled for this video</p>
            </div>
          </div>
        )}

        {/* Video Controls */}
        {showControls && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#0AAC9E' }}>
                    <VideoIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {content?.description || content?.title || 'Video Content'}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                      {isPlaying && (
                        <>
                          <span>•</span>
                          <span>Playing at {playbackRate}x</span>
                        </>
                      )}
                      {currentSubtitle && (
                        <>
                          <span>•</span>
                          <span style={{ color: '#0AAC9E' }}>
                            {getLanguageName(currentSubtitle.language)} Subtitles
                          </span>
                        </>
                      )}
                      {content?.isSeekingEnabled === false && (
                        <>
                          <span>•</span>
                          <span className="text-yellow-400">Seeking Disabled</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Playback Rate Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowPlaybackRateMenu(!showPlaybackRateMenu)}
                    className="bg-black/50 text-white text-sm px-3 py-2 rounded-lg hover:bg-black/70 transition-colors"
                  >
                    {playbackRate}x
                  </button>
                  {showPlaybackRateMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-black/90 rounded-lg p-2 min-w-20">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`w-full text-left text-white hover:bg-white/20 px-3 py-2 rounded text-sm transition-colors ${playbackRate === rate ? 'bg-white/20' : ''}`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center Play Button */}
            {!isPlaying && !isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: 'rgba(10, 172, 158, 0.8)' }}
                >
                  <Play className="w-10 h-10 text-white ml-1" />
                </button>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {/* Progress Bar */}
              <div className="mb-4 relative">
                <div 
                  ref={progressBarRef}
                  className={`relative h-2 bg-white/30 rounded-full group hover:h-3 transition-all ${
                    content?.isSeekingEnabled === false ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  onMouseDown={handleProgressMouseDown}
                  onMouseMove={handleProgressMouseMove}
                  onMouseLeave={handleProgressMouseLeave}
                >
                  {/* Buffered Progress */}
                  <div 
                    className="absolute h-full bg-white/50 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, bufferedPercentage))}%` }}
                  />
                  
                  {/* Watched Progress */}
                  <div 
                    className="absolute h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, Math.max(0, progressPercentage))}%`,
                      backgroundColor: '#0AAC9E'
                    }}
                  />
                  
                  {/* Progress Handle */}
                  {content?.isSeekingEnabled !== false && (
                    <div 
                      className={`absolute w-4 h-4 rounded-full -mt-1 -ml-2 shadow-lg transition-opacity ${
                        isDragging || showTimeTooltip ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      style={{ 
                        left: `${Math.min(100, Math.max(0, progressPercentage))}%`,
                        backgroundColor: '#0AAC9E'
                      }}
                    />
                  )}
                  
                  {/* Hover Preview Handle */}
                  {showTimeTooltip && !isDragging && content?.isSeekingEnabled !== false && (
                    <div 
                      className="absolute w-3 h-3 bg-yellow-400 rounded-full -mt-0.5 -ml-1.5 opacity-60"
                      style={{ left: `${hoverPosition}%` }}
                    />
                  )}
                </div>
                
                {/* Time Tooltip */}
                {showTimeTooltip && hoverTime !== null && (
                  <div 
                    className="absolute -top-10 transform -translate-x-1/2 bg-black/80 text-white text-xs rounded px-2 py-1 pointer-events-none"
                    style={{ left: `${hoverPosition}%` }}
                  >
                    {content?.isSeekingEnabled === false ? 'Seeking disabled' : formatTime(hoverTime)}
                  </div>
                )}
                
                {/* Time Display */}
                <div className="flex justify-between text-xs text-white/80 mt-2">
                  <span>{formatTime(isDragging ? (dragPosition * duration / 100) : currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Skip Back */}
                  <button 
                    onClick={() => skipTime(-10)} 
                    disabled={content?.isSeekingEnabled === false}
                    className={`text-white p-2 rounded-lg transition-colors ${
                      content?.isSeekingEnabled === false 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:text-gray-300'
                    }`}
                    title={content?.isSeekingEnabled === false ? 'Seeking disabled' : 'Skip back 10s'}
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  
                  {/* Play/Pause */}
                  <button 
                    onClick={togglePlay} 
                    className="text-white p-3 rounded-lg transition-colors"
                    style={{ backgroundColor: 'rgba(10, 172, 158, 0.2)' }}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </button>
                  
                  {/* Skip Forward */}
                  <button 
                    onClick={() => skipTime(10)} 
                    disabled={content?.isSeekingEnabled === false}
                    className={`text-white p-2 rounded-lg transition-colors ${
                      content?.isSeekingEnabled === false 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:text-gray-300'
                    }`}
                    title={content?.isSeekingEnabled === false ? 'Seeking disabled' : 'Skip forward 10s'}
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={toggleMute}
                      className="text-white hover:text-gray-300 p-2 rounded-lg transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <div className="relative group">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #0AAC9E 0%, #0AAC9E ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
                        }}
                      />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Subtitles Menu */}
                  {showSubtitles && (
                    <div className="relative">
                      <button
                        onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                        className={`text-white hover:text-gray-300 p-2 rounded-lg transition-colors ${
                          currentSubtitle ? 'bg-white/20' : 'hover:bg-white/10'
                        }`}
                        style={currentSubtitle ? { backgroundColor: 'rgba(10, 172, 158, 0.3)' } : {}}
                        title="Subtitles"
                      >
                        <Languages className="w-5 h-5" />
                        {subtitleLoading && (
                          <Loader2 className="w-3 h-3 animate-spin absolute -top-1 -right-1" style={{ color: '#0AAC9E' }} />
                        )}
                      </button>
                      
                      {showSubtitleMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-3 min-w-64 border border-white/20">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white text-sm font-medium">Subtitles</h4>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setShowSubtitleEditor(true);
                                  setShowSubtitleMenu(false);
                                }}
                                className="text-white hover:text-gray-300 p-1 rounded transition-colors"
                                style={{ color: '#0AAC9E' }}
                                title="Manage subtitles"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setShowSubtitleUpload(true);
                                  setShowSubtitleMenu(false);
                                }}
                                className="text-white hover:text-gray-300 p-1 rounded transition-colors"
                                style={{ color: '#0AAC9E' }}
                                title="Upload subtitle"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            <button
                              onClick={() => {
                                handleSubtitleChange(null);
                                setShowSubtitleMenu(false);
                              }}
                              className={`w-full text-left text-white hover:bg-white/20 px-3 py-2 rounded text-sm transition-colors ${
                                !currentSubtitle ? 'bg-white/20' : ''
                              }`}
                            >
                              Off
                            </button>
                            {subtitles.map(subtitle => (
                              <button
                                key={subtitle.id}
                                onClick={() => {
                                  handleSubtitleChange(subtitle);
                                  setShowSubtitleMenu(false);
                                }}
                                className={`w-full text-left text-white hover:bg-white/20 px-3 py-2 rounded text-sm transition-colors ${
                                  currentSubtitle?.id === subtitle.id ? 'bg-white/20' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">{getLanguageName(subtitle.language)}</div>
                                    <div className="text-xs text-gray-400">{subtitle.name}</div>
                                  </div>
                                  {currentSubtitle?.id === subtitle.id && (
                                    <Eye className="w-4 h-4" style={{ color: '#0AAC9E' }} />
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add Interaction Button */}
                  {showInteractions && (
                    <button
                      onClick={() => setShowAddInteraction(true)}
                      className="text-white hover:text-gray-300 p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="Add interaction at current time"
                    >
                      <Target className="w-5 h-5" style={{ color: '#0AAC9E' }} />
                    </button>
                  )}

                  {/* Download Button */}
                  {videoUrl && !videoUrl.startsWith('blob:') && (
                    <a
                      href={videoUrl}
                      download
                      className="text-white hover:text-gray-300 p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="Download video"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  )}

                  {/* Settings */}
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="text-white hover:text-gray-300 p-2 rounded-lg hover:bg-white/10 transition-colors relative"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                    {showQualityMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-3 min-w-48">
                        <h4 className="text-white text-sm font-medium mb-2">Video Settings</h4>
                        <div className="space-y-2 text-sm">
                          <div className="text-gray-300">Quality: Auto</div>
                          <div className="text-gray-300">Speed: {playbackRate}x</div>
                          <div className="text-gray-300">
                            Subtitles: {currentSubtitle ? getLanguageName(currentSubtitle.language) : 'Off'}
                          </div>
                          <div className="text-gray-300">
                            Seeking: {content?.isSeekingEnabled === false ? 'Disabled' : 'Enabled'}
                          </div>
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Fullscreen Toggle */}
                  <button 
                    onClick={toggleFullscreen}
                    className="text-white hover:text-gray-300 p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Fullscreen"
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtitle Upload Modal */}
      {showSubtitleUpload && (
        <SubtitleUploadModal
          contentId={contentId}
          currentTime={currentTime}
          onSubtitleAdded={(newSubtitle) => {
            setSubtitles(prev => [...prev, newSubtitle]);
            setShowSubtitleUpload(false);
          }}
          onClose={() => setShowSubtitleUpload(false)}
        />
      )}

      {/* Subtitle Editor Modal */}
      {showSubtitleEditor && (
        <SubtitleEditorModal
          contentId={contentId}
          subtitles={subtitles}
          onSubtitleUpdated={(updatedSubtitles) => {
            setSubtitles(updatedSubtitles);
            setShowSubtitleEditor(false);
          }}
          onClose={() => setShowSubtitleEditor(false)}
        />
      )}

      {/* Video Interaction Modal */}
      {showAddInteraction && (
        <VideoInteractionModal
          currentTime={currentTime}
          contentId={contentId}
          onClose={() => setShowAddInteraction(false)}
          onInteractionAdded={(interaction) => {
            console.log('Interaction added:', interaction);
            setShowAddInteraction(false);
          }}
          formatTime={formatTime}
        />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
        }
        
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #0AAC9E;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #0AAC9E;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

// Real API Subtitle Upload Component
const SubtitleUploadModal = ({ contentId, currentTime, onClose, onSubtitleAdded }) => {
  const [subtitleFile, setSubtitleFile] = useState(null);
  const [subtitleName, setSubtitleName] = useState('');
  const [subtitleLanguage, setSubtitleLanguage] = useState(SUBTITLE_LANGUAGES.ENGLISH);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('text') && !file.name.match(/\.(vtt|srt)$/i)) {
        setError('Please select a valid VTT or SRT subtitle file');
        return;
      }

      setSubtitleFile(file);
      if (!subtitleName) {
        setSubtitleName(file.name.replace(/\.(vtt|srt)$/i, ''));
      }
      
      // Preview file content
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setPreview(content.split('\n').slice(0, 10).join('\n'));
      };
      reader.readAsText(file);
      setError(null);
    }
  };

  // FIXED: SubtitleUploadModal with proper user ID
const handleUpload = async () => {
  if (!subtitleFile || !subtitleName.trim()) {
    setError('Please select a VTT/SRT file and enter a name');
    return;
  }

  setIsUploading(true);
  setError(null);

  try {
    const subtitleData = {
      courseContentId: contentId,
      language: subtitleLanguage,
      name: subtitleName.trim(),
      subtitleFile: subtitleFile
      // UserId will be added automatically in the API function
    };

    const response = await addSubtitle(subtitleData);
    onSubtitleAdded(response);
  } catch (error) {
    console.error('Subtitle upload error:', error);
    setError(error.message || 'Failed to upload subtitle');
  } finally {
    setIsUploading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: '#0AAC9E' }}>Upload Subtitle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Subtitle File (VTT/SRT)</label>
            <input
              type="file"
              accept=".vtt,.srt,text/vtt,application/x-subrip"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#0AAC9E' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: WebVTT (.vtt), SubRip (.srt)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={subtitleName}
              onChange={(e) => setSubtitleName(e.target.value)}
              placeholder="Subtitle name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#0AAC9E' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={subtitleLanguage}
              onChange={(e) => setSubtitleLanguage(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#0AAC9E' }}
            >
              {Object.entries(SUBTITLE_LANGUAGES).map(([key, value]) => (
                <option key={key} value={value}>
                  {getLanguageName(value)}
                </option>
              ))}
            </select>
          </div>

          {/* Current Time Info */}
          <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(10, 172, 158, 0.1)', borderColor: '#0AAC9E', borderWidth: '1px' }}>
            <p className="text-sm" style={{ color: '#0AAC9E' }}>
              <Clock className="w-4 h-4 inline mr-1" />
              Current video time: {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
            </p>
          </div>

          {/* File Preview */}
          {preview && (
            <div>
              <label className="block text-sm font-medium mb-2">Preview</label>
              <div className="bg-gray-50 border rounded-lg p-3 max-h-32 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap">{preview}</pre>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || !subtitleFile || !subtitleName.trim()}
            className="px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#0AAC9E' }}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                Uploading...
              </>
            ) : (
              'Upload Subtitle'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Real API Subtitle Editor Component
const SubtitleEditorModal = ({ contentId, subtitles, onSubtitleUpdated, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteSubtitle = async (subtitleId) => {
    if (!confirm('Are you sure you want to delete this subtitle?')) return;

    try {
      setIsLoading(true);
      console.log('🗑️ Deleting subtitle:', subtitleId);
      
      await deleteSubtitle(subtitleId);
      console.log('✅ Subtitle deleted');
      
      const updatedSubtitles = subtitles.filter(s => s.id !== subtitleId);
      onSubtitleUpdated(updatedSubtitles);
    } catch (error) {
      console.error('❌ Failed to delete subtitle:', error);
      alert('Failed to delete subtitle: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: '#0AAC9E' }}>Manage Subtitles</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {subtitles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: '#0AAC9E' }} />
              <p>No subtitles available</p>
              <p className="text-sm">Upload a subtitle file to get started</p>
            </div>
          ) : (
            subtitles.map((subtitle) => (
              <div key={subtitle.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium">{subtitle.name}</div>
                  <div className="text-sm text-gray-500">
                    {getLanguageName(subtitle.language)} • 
                    {subtitle.fileName || 'Subtitle file'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 rounded transition-colors"
                    style={{ color: '#0AAC9E' }}
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSubtitle(subtitle.id)}
                    disabled={isLoading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Real API Video Interaction Component with Evaluation Support
const VideoInteractionModal = ({ currentTime, contentId, onClose, onInteractionAdded, formatTime }) => {
  const [interactionType, setInteractionType] = useState(INTERACTION_TYPES.QUESTION);
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { optionText: '', isCorrect: false, displayOrder: 0 },
    { optionText: '', isCorrect: false, displayOrder: 1 }
  ]);
  const [informationContent, setInformationContent] = useState('');
  const [evaluationEmojiSet, setEvaluationEmojiSet] = useState(EVALUATION_EMOJI_SETS.SMILE_EMOJI);
  const [evaluationPrompt, setEvaluationPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const addOption = () => {
    setOptions(prev => [...prev, { 
      optionText: '', 
      isCorrect: false, 
      displayOrder: prev.length 
    }]);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(prev => prev.filter((_, i) => i !== index).map((opt, i) => ({
        ...opt,
        displayOrder: i
      })));
    }
  };

  const updateOption = (index, field, value) => {
    setOptions(prev => prev.map((option, i) => 
      i === index ? { ...option, [field]: value } : option
    ));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (interactionType === INTERACTION_TYPES.QUESTION && !questionText.trim()) {
      setError('Please enter a question');
      return;
    }

    if (interactionType === INTERACTION_TYPES.QUESTION) {
      const hasCorrectAnswer = options.some(opt => opt.isCorrect && opt.optionText.trim());
      if (!hasCorrectAnswer) {
        setError('Please mark at least one option as correct');
        return;
      }
    }

    if (interactionType === INTERACTION_TYPES.INFORMATION && !informationContent.trim()) {
      setError('Please enter information content');
      return;
    }

    if (interactionType === INTERACTION_TYPES.EVALUATION && !evaluationPrompt.trim()) {
      setError('Please enter evaluation prompt text');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('🎯 Creating video interaction:', {
        contentId,
        type: interactionType,
        time: currentTime,
        title: title.trim()
      });

      const interactionData = {
        courseContentId: contentId,
        interactionType,
        startTimeInVideo: currentTime,
        title: title.trim()
      };

      if (interactionType === INTERACTION_TYPES.QUESTION) {
        interactionData.questionDetails = {
          questionText: questionText.trim(),
          questionType: 1, // Multiple choice
          options: options.filter(opt => opt.optionText.trim()).map((opt, index) => ({
            ...opt,
            displayOrder: index
          }))
        };
      } else if (interactionType === INTERACTION_TYPES.INFORMATION) {
        interactionData.informationDetails = {
          informationHtmlContent: informationContent.trim()
        };
      } else if (interactionType === INTERACTION_TYPES.EVALUATION) {
        interactionData.evaluationDetails = {
          emojiSet: evaluationEmojiSet,
          promptText: evaluationPrompt.trim()
        };
      }

      const response = await addVideoInteraction(interactionData);
      console.log('✅ Video interaction created:', response);
      
      onInteractionAdded(response);
    } catch (error) {
      console.error('❌ Failed to create interaction:', error);
      setError(error.message || 'Failed to add interaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold" style={{ color: '#0AAC9E' }}>Add Video Interaction</h3>
            <p className="text-sm text-gray-600">At time: {formatTime(currentTime)}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Interaction Type</label>
            <select
              value={interactionType}
              onChange={(e) => setInteractionType(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#0AAC9E' }}
            >
              <option value={INTERACTION_TYPES.QUESTION}>Question</option>
              <option value={INTERACTION_TYPES.EVALUATION}>Evaluation</option>
              <option value={INTERACTION_TYPES.INFORMATION}>Information</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter interaction title"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#0AAC9E' }}
            />
          </div>

          {interactionType === INTERACTION_TYPES.QUESTION && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Question</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter your question"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#0AAC9E' }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Answer Options</label>
                  <button
                    onClick={addOption}
                    className="text-sm font-medium transition-colors"
                    style={{ color: '#0AAC9E' }}
                  >
                    + Add Option
                  </button>
                </div>

                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={option.optionText}
                      onChange={(e) => updateOption(index, 'optionText', e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#0AAC9E' }}
                    />
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={option.isCorrect}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setOptions(prev => prev.map((opt, i) => ({
                              ...opt,
                              isCorrect: i === index
                            })));
                          }
                        }}
                        className="mr-1"
                        style={{ accentColor: '#0AAC9E' }}
                      />
                      <span className="text-sm">Correct</span>
                    </label>
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-700 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {interactionType === INTERACTION_TYPES.INFORMATION && (
            <div>
              <label className="block text-sm font-medium mb-2">Information Content</label>
              <textarea
                value={informationContent}
                onChange={(e) => setInformationContent(e.target.value)}
                placeholder="Enter information content (HTML supported)"
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#0AAC9E' }}
              />
            </div>
          )}

          {interactionType === INTERACTION_TYPES.EVALUATION && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Evaluation Prompt</label>
                <input
                  type="text"
                  value={evaluationPrompt}
                  onChange={(e) => setEvaluationPrompt(e.target.value)}
                  placeholder="How would you rate this content?"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#0AAC9E' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Emoji Set</label>
                <select
                  value={evaluationEmojiSet}
                  onChange={(e) => setEvaluationEmojiSet(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#0AAC9E' }}
                >
                  <option value={EVALUATION_EMOJI_SETS.SMILE_EMOJI}>Smile Emojis (😞 to 🤩)</option>
                  <option value={EVALUATION_EMOJI_SETS.HEART_EMOJI}>Heart Emojis (🖤 to ❤️)</option>
                  <option value={EVALUATION_EMOJI_SETS.MEDAL_EMOJI}>Medal Emojis (🏅 to 🏆)</option>
                  <option value={EVALUATION_EMOJI_SETS.PLANT_EMOJI}>Plant Emojis (🌱 to 🌳)</option>
                </select>
              </div>

              {/* Emoji Preview */}
              <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(10, 172, 158, 0.1)', borderColor: '#0AAC9E', borderWidth: '1px' }}>
                <p className="text-sm font-medium mb-2" style={{ color: '#0AAC9E' }}>Preview:</p>
                <div className="flex items-center justify-between text-sm">
                  {EMOJI_MAPPINGS[evaluationEmojiSet]?.map((emoji, index) => (
                    <div key={index} className="text-center">
                      <div className="text-lg mb-1">{emoji.emoji}</div>
                      <div className="text-xs text-gray-600">{emoji.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            className="px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#0AAC9E' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                Adding...
              </>
            ) : (
              'Add Interaction'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoPlayer;