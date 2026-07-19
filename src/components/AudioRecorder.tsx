import { useState, useRef, useEffect } from "react";
import { Mic, Square, AlertCircle, Play, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AudioRecorderProps {
  onAudioReady: (base64Data: string, mimeType: string) => void;
  isProcessing: boolean;
}

export default function AudioRecorder({ onAudioReady, isProcessing }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(24).fill(4));

  // Clean up timer and animation on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Visualizer simulation during recording
  useEffect(() => {
    if (isRecording) {
      const updateWave = () => {
        setWaveHeights(prev =>
          prev.map(() => Math.floor(Math.random() * 28) + 6)
        );
        animationFrameRef.current = requestAnimationFrame(updateWave);
      };
      animationFrameRef.current = requestAnimationFrame(updateWave);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setWaveHeights(Array(24).fill(4));
    }
  }, [isRecording]);

  // Start recording audio
  const startRecording = async () => {
    setError(null);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine appropriate mimeType (safely fallback to webm or wav)
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/ogg";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/mp4";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = ""; // Browser default
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          // Extract actual base64 bytes by trimming the prefix 'data:audio/webm;base64,'
          const commaIndex = base64Data.indexOf(",");
          if (commaIndex !== -1) {
            onAudioReady(base64Data.substring(commaIndex + 1), mediaRecorder.mimeType || "audio/webm");
          }
        };

        // Stop all tracks to release microphone hardware light
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250); // Slice size in ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Microphone access failed:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Microphone permission denied. In some sandbox browser settings, micro-permissions are blocked inside inline previews. You can paste conversational text into the text console below or use our realistic preset templates instead!");
      } else {
        setError("Could not start audio recorder. Please try copy-pasting your conversation text instead.");
      }
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm shadow-xl flex flex-col items-center">
      <div className="w-full text-center mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center justify-center gap-2">
          <Mic className="w-4 h-4 text-indigo-400" />
          Live Verbal Negotiation Recorder
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Record landlords, bosses, or reps to analyze their statements instantly.
        </p>
      </div>

      {/* Recording stage/equalizer */}
      <div className="relative w-full h-24 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden mb-5">
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              {/* Dynamic waveform equalizers */}
              <div className="flex items-center gap-1 h-8">
                {waveHeights.map((height, i) => (
                  <motion.div
                    key={i}
                    animate={{ height }}
                    className="w-1 bg-indigo-500 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                ))}
              </div>
              <span className="text-xs font-mono font-medium text-red-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                RECORDING • {formatTime(recordingTime)}
              </span>
            </motion.div>
          ) : isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-indigo-400"
            >
              <div className="flex items-center gap-1">
                <Sparkles className="w-5 h-5 animate-spin text-indigo-400" />
              </div>
              <span className="text-xs font-mono font-medium text-indigo-300">
                AI TRANSCRIBING & ADVOCATING...
              </span>
            </motion.div>
          ) : audioUrl ? (
            <motion.div
              key="has-audio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <audio src={audioUrl} controls className="h-10 max-w-xs" />
              <span className="text-[10px] font-mono text-slate-500">
                RECORDED CLIP SUCCESSFULLY EXPORTED
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <span className="text-xs text-slate-500 font-mono">
                MIC READY FOR VERBAL RECORDING
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        {isRecording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 active:scale-95 transition-all duration-200 shadow-md shadow-red-500/5"
          >
            <Square className="w-4 h-4 fill-red-400" />
            Stop Recording
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-200 shadow-lg shadow-indigo-600/20"
          >
            <Mic className="w-4 h-4" />
            Start Voice Record
          </button>
        )}
      </div>

      {/* Error Displays (with clean fallback instructions) */}
      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/30 flex items-start gap-2.5 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  );
}
