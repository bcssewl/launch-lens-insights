import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import VoiceRecordingGuide from './VoiceRecordingGuide';

interface VoiceRecorderProps {
  onComplete: (audioBlob: Blob) => void;
  onBack: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onComplete, onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
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
    }
  };

  const resetRecording = () => {
    setRecordingTime(0);
    setAudioBlob(null);
    setIsPlaying(false);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressValue = (recordingTime / maxRecordingTime) * 100;

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto">
      {/* Voice Recording Guide */}
      <div className="lg:w-80 flex-shrink-0">
        <VoiceRecordingGuide 
          isVisible={showGuide}
          onToggleVisibility={() => setShowGuide(!showGuide)}
        />
      </div>

      {/* Main Recording Interface */}
      <Card className={`flex-1 glass-card transition-all duration-500 ${
        isActiveRecording ? 'recording-glow recording-border' : ''
      }`}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Record Your Idea</CardTitle>
          <p className="text-muted-foreground">
            Tell us about your startup idea in your own words. You have up to 10 minutes.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="mb-4">
              <div className="text-3xl font-mono font-bold">{formatTime(recordingTime)}</div>
              <Progress value={progressValue} className="w-full mt-2" />
            </div>

            {/* Recording Visualization with Animated Sphere */}
            <div className={`recording-visualization mb-6 transition-all duration-500 ${
              isActiveRecording ? 'bg-primary/5 border-primary/30' : ''
            }`}>
              <div className="flex justify-center items-center h-32">
                {isActiveRecording ? (
                  <div className="recording-sphere recording-sphere-enter" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted/50 backdrop-blur-sm flex items-center justify-center border border-muted/30 transition-all duration-300">
                    <Mic className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Recording Controls with Glass Effect */}
            <div className={`glass-controls p-4 mb-6 transition-all duration-300 ${
              isActiveRecording ? 'bg-primary/5' : ''
            }`}>
              <div className="flex justify-center space-x-4">
                {!isRecording && !audioBlob && (
                  <Button onClick={startRecording} size="lg" className="rounded-full gradient-button">
                    <Mic className="mr-2 h-5 w-5" />
                    Start Recording
                  </Button>
                )}

                {isRecording && (
                  <>
                    <Button onClick={stopRecording} size="lg" variant="destructive" className="rounded-full">
                      <Square className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                    {isPaused ? (
                      <Button onClick={resumeRecording} size="lg" className="rounded-full gradient-button">
                        <Mic className="mr-2 h-5 w-5" />
                        Resume
                      </Button>
                    ) : (
                      <Button onClick={pauseRecording} size="lg" variant="outline" className="rounded-full apple-button-outline">
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </Button>
                    )}
                  </>
                )}

                {audioBlob && (
                  <>
                    {!isPlaying ? (
                      <Button onClick={playRecording} size="lg" variant="outline" className="rounded-full apple-button-outline">
                        <Play className="mr-2 h-4 w-4" />
                        Play
                      </Button>
                    ) : (
                      <Button onClick={pausePlayback} size="lg" variant="outline" className="rounded-full apple-button-outline">
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={resetRecording} size="lg" variant="outline" className="rounded-full apple-button-outline">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Re-record
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={onBack} className="apple-button-outline">
                Back to Options
              </Button>
              {audioBlob && (
                <Button onClick={() => onComplete(audioBlob)} className="gradient-button">
                  Continue to Review
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
    </div>
  );
};

export default VoiceRecorder;
