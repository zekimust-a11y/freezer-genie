import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceControlProps {
  onCommand: (command: string) => void;
  onTranscript?: (transcript: string) => void;
}

export function VoiceControl({ onCommand, onTranscript }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice control.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript?.(transcript);
      onCommand(transcript.toLowerCase());
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      if (event.error === "not-allowed") {
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to use voice control.",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setIsListening(false);
    }
  }, [onCommand, onTranscript, toast]);

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={isListening ? "default" : "outline"}
      size="icon"
      onClick={startListening}
      disabled={isListening}
      className={isListening ? "animate-pulse" : ""}
      data-testid="button-voice-control"
    >
      {isListening ? (
        <Mic className="h-4 w-4" />
      ) : (
        <MicOff className="h-4 w-4" />
      )}
    </Button>
  );
}

export function useVoiceCommands() {
  const processCommand = useCallback((command: string): { action: string; value?: string } => {
    const cmd = command.toLowerCase().trim();
    
    if (cmd.startsWith("add ")) {
      return { action: "add", value: cmd.replace("add ", "").trim() };
    }
    
    if (cmd.startsWith("search ") || cmd.startsWith("find ")) {
      const value = cmd.replace(/^(search|find)\s+/, "").trim();
      return { action: "search", value };
    }
    
    if (cmd.includes("go home") || cmd.includes("inventory") || cmd.includes("home")) {
      return { action: "navigate", value: "/" };
    }
    
    if (cmd.includes("alert") || cmd.includes("expir")) {
      return { action: "tab", value: "alerts" };
    }
    
    if (cmd.includes("list") || cmd.includes("shopping")) {
      return { action: "tab", value: "list" };
    }
    
    if (cmd.includes("setting")) {
      return { action: "tab", value: "settings" };
    }
    
    return { action: "unknown", value: cmd };
  }, []);

  return { processCommand };
}
