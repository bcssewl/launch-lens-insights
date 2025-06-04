
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, RotateCcw, ArrowLeft, HelpCircle, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import VoiceRecordingGuide from './VoiceRecordingGuide';
import { useAudioRecordings } from '@/hooks/useAudioRecordings';
import { convertToWav } from '@/utils/audioConverter';

interface VoiceRecorderProps {
  onComplete: (audioBlob: Blob, recordingId?: string) => void;
  onBack: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onComplete, onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [autoShowedGuide, setAutoShowedGuide] = useState(false);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { uploading, processing, uploadAudioRecording, transcribeAudioWithN8n } = useAudioRecordings();

  const maxRecordingTime = 600; // 10 minutes in seconds

  const isActiveRecording = isRecording && !isPaused;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxRecordingTime) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Convert to WAV format
        try {
          setIsConverting(true);
          const wavBlob = await convertToWav(webmBlob);
          setAudioBlob(wavBlob);
          console.log('Audio converted to WAV format successfully');
        } catch (error) {
          console.error('Error converting audio to WAV:', error);
          toast({
            title: "Conversion Warning",
            description: "Could not convert to WAV format, using original recording.",
            variant: "destructive",
          });
          setAudioBlob(webmBlob);
        } finally {
          setIsConverting(false);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Auto-show guide when recording starts
      if (!autoShowedGuide) {
        setShowGuide(true);
        setAutoShowedGuide(true);
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setShowGuide(false); // Hide guide when recording stops
    }
  };

  const resetRecording = () => {
    setRecordingTime(0);
    setAudioBlob(null);
    setIsPlaying(false);
    setRecordingId(null);
    setIsProcessingComplete(false);
  };

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleUploadTranscribeAndComplete = async () => {
    if (!audioBlob) return;

    try {
      // Step 1: Upload to Supabase (now as WAV)
      const fileName = `voice_recording_${Date.now()}.wav`;
      const uploadedRecording = await uploadAudioRecording(audioBlob, fileName, recordingTime);
      
      if (!uploadedRecording) {
        toast({
          title: "Upload Failed",
          description: "Failed to upload audio recording. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setRecordingId(uploadedRecording.id);
      
      // Step 2: Transcribe with n8n
      const transcription = await transcribeAudioWithN8n(uploadedRecording.id);
      
      if (transcription) {
        setIsProcessingComplete(true);
        
        toast({
          title: "Processing Complete",
          description: "Your recording has been transcribed and will now be used to fill out the form.",
        });
        
        // Step 3: Automatically proceed to form completion
        onComplete(audioBlob, uploadedRecording.id);
      } else {
        toast({
          title: "Transcription Failed",
          description: "Failed to transcribe audio. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in upload and transcribe process:', error);
      toast({
        title: "Processing Failed",
        description: "An error occurred during processing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressValue = (recordingTime / maxRecordingTime) * 100;

  return (
    <div className="w-full max-w-none overflow-x-hidden mobile-container">
      {/* Voice Recording Guide Overlay - Only show when recording starts */}
      {showGuide && isActiveRecording && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute top-4 left-4 pointer-events-auto max-w-sm">
            <VoiceRecordingGuide 
              isVisible={true}
              onToggleVisibility={() => setShowGuide(!showGuide)}
              autoShowed={autoShowedGuide}
              isRecording={isActiveRecording}
            />
          </div>
        </div>
      )}

      {/* Main Recording Interface */}
      <Card className={`w-full mx-auto max-w-2xl mobile-gradient-card transition-all duration-500 relative ${
        isActiveRecording ? 'recording-glow recording-border' : ''
      }`}>
        {/* Top-left back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          className="absolute top-4 left-4 z-10 h-8 w-8 p-0 hover:bg-muted/50"
          aria-label="Back to input method options"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <CardHeader className="text-center mobile-spacing pt-12">
          <CardTitle className="mobile-heading text-primary">Record Your Idea</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tell us about your startup idea in your own words. You have up to 10 minutes.
            {isConverting && <span className="block mt-1 text-blue-600">Converting to WAV format...</span>}
          </p>
        </CardHeader>
        <CardContent className="mobile-spacing">
          <div className="text-center">
            <div className="mb-4">
              <div className="text-2xl sm:text-3xl font-mono font-bold">{formatTime(recordingTime)}</div>
              <Progress value={progressValue} className="mobile-gradient-progress w-full mt-2" />
            </div>

            {/* Recording Visualization with Animated Sphere */}
            <div className={`recording-visualization mb-4 transition-all duration-500 ${
              isActiveRecording ? 'bg-primary/5 border-primary/30' : ''
            }`}>
              <div className="flex justify-center items-center h-24 sm:h-32">
                {isActiveRecording ? (
                  <div className="recording-sphere recording-sphere-enter" />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted/50 backdrop-blur-sm flex items-center justify-center border border-muted/30 transition-all duration-300">
                    <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Recording Controls with Glass Effect */}
            <div className={`glass-controls mobile-spacing mb-4 transition-all duration-300 ${
              isActiveRecording ? 'bg-primary/5' : ''
            }`}>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                {!isRecording && !audioBlob && (
                  <Button 
                    onClick={startRecording} 
                    size="lg" 
                    className="w-full sm:w-auto rounded-full mobile-gradient-button touch-target"
                    disabled={isConverting}
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    Start Recording
                  </Button>
                )}

                {isRecording && (
                  <>
                    <Button 
                      onClick={stopRecording} 
                      size="lg" 
                      variant="destructive" 
                      className="w-full sm:w-auto rounded-full touch-target"
                    >
                      <Square className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                    {isPaused ? (
                      <Button 
                        onClick={resumeRecording} 
                        size="lg" 
                        className="w-full sm:w-auto rounded-full mobile-gradient-button touch-target"
                      >
                        <Mic className="mr-2 h-5 w-5" />
                        Resume
                      </Button>
                    ) : (
                      <Button 
                        onClick={pauseRecording} 
                        size="lg" 
                        variant="outline" 
                        className="w-full sm:w-auto rounded-full apple-button-outline touch-target"
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </Button>
                    )}
                  </>
                )}

                {audioBlob && !isProcessingComplete && !isConverting && (
                  <>
                    {!isPlaying ? (
                      <Button 
                        onClick={playRecording} 
                        size="lg" 
                        variant="outline" 
                        className="w-full sm:w-auto rounded-full apple-button-outline touch-target"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Play
                      </Button>
                    ) : (
                      <Button 
                        onClick={pausePlayback} 
                        size="lg" 
                        variant="outline" 
                        className="w-full sm:w-auto rounded-full apple-button-outline touch-target"
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </Button>
                    )}
                    <Button 
                      onClick={resetRecording} 
                      size="lg" 
                      variant="outline" 
                      className="w-full sm:w-auto rounded-full apple-button-outline touch-target"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Re-record
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              {!isRecording && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowGuide(true)}
                  className="w-full sm:w-auto apple-button-outline touch-target"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Show Guide
                </Button>
              )}
              {audioBlob && !isProcessingComplete && !isConverting && (
                <Button 
                  onClick={handleUploadTranscribeAndComplete}
                  disabled={uploading || processing}
                  className="w-full sm:w-auto mobile-gradient-button touch-target"
                >
                  {uploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-pulse" />
                      Uploading WAV...
                    </>
                  ) : processing ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Transcribing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Process
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <audio
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Show guide overlay when not recording but guide is toggled */}
      {showGuide && !isActiveRecording && (
        <VoiceRecordingGuide 
          isVisible={true}
          onToggleVisibility={() => setShowGuide(false)}
          autoShowed={false}
          isRecording={false}
        />
      )}
    </div>
  );
};

export default VoiceRecorder;
